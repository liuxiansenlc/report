package com.report.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.report.entity.CropPhStandard;
import com.report.entity.EconomicIndicator;
import com.report.entity.FarmInfo;
import com.report.entity.SoilTestData;
import com.report.entity.TestReport;
import com.report.mapper.CropPhStandardMapper;
import com.report.mapper.EconomicIndicatorMapper;
import com.report.mapper.FarmInfoMapper;
import com.report.mapper.SoilTestDataMapper;
import com.report.mapper.TestReportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.UUID;

@Service
public class AiImprovementPlanService {

    private static final String REPORT_TYPE_PLAN = "改良方案";
    private static final String SOURCE_AI = "AI";
    private static final BigDecimal PATHOGEN_HIGH_RISK = new BigDecimal("0.005");
    private static final BigDecimal ORGANIC_TARGET = new BigDecimal("30");
    private static final BigDecimal N_TARGET = new BigDecimal("4");
    private static final BigDecimal P_TARGET = new BigDecimal("2");
    private static final BigDecimal K_TARGET = new BigDecimal("6");

    @Autowired private FarmInfoMapper farmInfoMapper;
    @Autowired private CropPhStandardMapper cropPhStandardMapper;
    @Autowired private SoilTestDataMapper soilTestDataMapper;
    @Autowired private EconomicIndicatorMapper economicIndicatorMapper;
    @Autowired private TestReportMapper testReportMapper;

    @Value("${REPORT_PDF_FONT_PATH:${report.pdf.font-path:}}")
    private String configuredFontPath;

    public TestReport generate(String farmCode, Date reportDate, BigDecimal pathogenCount) {
        if (!StringUtils.hasText(farmCode)) {
            throw new IllegalArgumentException("请选择农场");
        }
        if (pathogenCount == null) {
            throw new IllegalArgumentException("请输入病原菌数");
        }

        FarmInfo farm = farmInfoMapper.selectOne(new LambdaQueryWrapper<FarmInfo>()
                .eq(FarmInfo::getFarmCode, farmCode)
                .last("LIMIT 1"));
        if (farm == null) {
            throw new IllegalArgumentException("未找到农场信息");
        }

        CropPhStandard crop = cropPhStandardMapper.selectOne(new LambdaQueryWrapper<CropPhStandard>()
                .eq(CropPhStandard::getCropName, farm.getCropVariety())
                .last("LIMIT 1"));
        if (crop == null) {
            throw new IllegalArgumentException("未找到该作物的 pH 标准");
        }

        SoilTestData soil = soilTestDataMapper.selectOne(new LambdaQueryWrapper<SoilTestData>()
                .eq(SoilTestData::getFarmCode, farmCode)
                .like(SoilTestData::getType, "改良前")
                .orderByDesc(SoilTestData::getCreatedAt)
                .orderByDesc(SoilTestData::getId)
                .last("LIMIT 1"));
        if (soil == null) {
            throw new IllegalArgumentException("未找到该农场改良前土壤检测数据");
        }

        EconomicIndicator economic = economicIndicatorMapper.selectOne(new LambdaQueryWrapper<EconomicIndicator>()
                .eq(EconomicIndicator::getFarmCode, farmCode)
                .like(EconomicIndicator::getType, "改良前")
                .orderByDesc(EconomicIndicator::getCreatedAt)
                .orderByDesc(EconomicIndicator::getId)
                .last("LIMIT 1"));

        File pdf = writePdf(farm, crop, soil, economic, pathogenCount);
        String storedName = pdf.getName();
        String displayName = "AI改良方案-" + safeName(farm.getFarmName()) + "-"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + ".pdf";

        TestReport existing = testReportMapper.selectOne(new LambdaQueryWrapper<TestReport>()
                .eq(TestReport::getFarmCode, farmCode)
                .eq(TestReport::getReportType, REPORT_TYPE_PLAN)
                .eq(TestReport::getReportSource, SOURCE_AI)
                .orderByDesc(TestReport::getCreatedAt)
                .orderByDesc(TestReport::getId)
                .last("LIMIT 1"));

        boolean hasVisiblePlan = testReportMapper.selectCount(new LambdaQueryWrapper<TestReport>()
                .eq(TestReport::getFarmCode, farmCode)
                .eq(TestReport::getReportType, REPORT_TYPE_PLAN)
                .eq(TestReport::getFrontendVisible, 1)) > 0;

        TestReport report = existing == null ? new TestReport() : existing;
        report.setFarmCode(farm.getFarmCode());
        report.setFarmName(farm.getFarmName());
        report.setReportType(REPORT_TYPE_PLAN);
        report.setReportDate(reportDate != null ? reportDate : new Date());
        report.setFileUrl("/api/uploads/" + storedName);
        report.setFileName(displayName);
        report.setReportSource(SOURCE_AI);
        if (report.getFrontendVisible() == null) {
            report.setFrontendVisible(hasVisiblePlan ? 0 : 1);
        }

        if (report.getId() == null) {
            testReportMapper.insert(report);
        } else {
            testReportMapper.updateById(report);
        }
        return report;
    }

    private File writePdf(FarmInfo farm, CropPhStandard crop, SoilTestData soil, EconomicIndicator economic, BigDecimal pathogenCount) {
        try {
            File uploadDir = new File("uploads");
            Files.createDirectories(uploadDir.toPath());
            File file = new File(uploadDir, UUID.randomUUID().toString().replace("-", "") + ".pdf");

            Document document = new Document(PageSize.A4, 42, 42, 42, 42);
            PdfWriter.getInstance(document, new FileOutputStream(file));
            document.open();

            BaseFont baseFont = BaseFont.createFont(resolveFontPath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font title = new Font(baseFont, 20, Font.BOLD);
            Font h2 = new Font(baseFont, 14, Font.BOLD);
            Font body = new Font(baseFont, 10, Font.NORMAL);
            Font bold = new Font(baseFont, 10, Font.BOLD);

            Paragraph heading = new Paragraph("AI改良方案", title);
            heading.setAlignment(Element.ALIGN_CENTER);
            heading.setSpacingAfter(18);
            document.add(heading);

            addSection(document, h2, "一、基本信息");
            addTable(document, bold, body, new String[][]{
                    {"农场名称", nz(farm.getFarmName())},
                    {"农场编号", nz(farm.getFarmCode())},
                    {"作物品种", nz(farm.getCropVariety())},
                    {"土地利用类型", nz(crop.getLandUseType())},
                    {"pH适宜范围", fmt(crop.getPhMin()) + " - " + fmt(crop.getPhMax())},
                    {"病原菌数", fmt(pathogenCount)}
            });

            addSection(document, h2, "二、土壤酸碱度专项改良");
            BigDecimal ph = soil.getPh();
            if (ph != null && crop.getPhMin() != null && ph.compareTo(crop.getPhMin()) < 0) {
                addText(document, body, "检测 pH 为 " + fmt(ph) + "，低于作物适宜下限，建议施用酸性土壤调理剂并配合有机肥提升缓冲能力。");
                addTable(document, bold, body, new String[][]{
                        {"物资", "酸性土壤调理剂"},
                        {"厂家口径", "按示例模板固定商品口径"},
                        {"建议用量", calcDose(crop.getPhMin().subtract(ph), new BigDecimal("80")) + " kg/亩"}
                });
            } else {
                addText(document, body, "当前 pH 未低于作物适宜下限，建议保持现有调理强度，后续复检跟踪。");
            }

            addSection(document, h2, "三、土传病害微生物防控");
            boolean highPathogen = pathogenCount.compareTo(PATHOGEN_HIGH_RISK) >= 0;
            addText(document, body, highPathogen
                    ? "病原菌数达到高风险阈值，建议加强拮抗菌剂和土壤消毒型生物制剂投入。"
                    : "病原菌数处于低风险范围，建议以预防性生物菌剂维护土壤微生态。");
            addTable(document, bold, body, new String[][]{
                    {"物资", highPathogen ? "复合微生物菌剂+土传病害防控菌剂" : "复合微生物菌剂"},
                    {"建议用量", highPathogen ? "8 kg/亩" : "4 kg/亩"}
            });

            addSection(document, h2, "四、有机质提升");
            BigDecimal organicMatter = soil.getOrganicMatter();
            if (organicMatter != null && organicMatter.compareTo(ORGANIC_TARGET) < 0) {
                addText(document, body, "有机质为 " + fmt(organicMatter) + " g/kg，低于 30 g/kg 目标值，建议补充腐熟有机肥。");
                addTable(document, bold, body, new String[][]{
                        {"物资", "商品有机肥"},
                        {"建议用量", calcDose(ORGANIC_TARGET.subtract(organicMatter), new BigDecimal("50")) + " kg/亩"}
                });
            } else {
                addText(document, body, "有机质达到目标阈值，建议维持秸秆还田、堆肥和微生物肥协同管理。");
            }

            addSection(document, h2, "五、养分比例调整");
            addText(document, body, "目标 N:P:K 比例按 4:2:6 执行，结合检测值对氮、磷、钾进行平衡补充。");
            addTable(document, bold, body, new String[][]{
                    {"指标", "当前值", "目标比例"},
                    {"水解氮", fmt(soil.getHydroNitrogen()), fmt(N_TARGET)},
                    {"有效磷", fmt(soil.getAvailPhosphorus()), fmt(P_TARGET)},
                    {"速效钾", fmt(soil.getAvailPotassium()), fmt(K_TARGET)}
            });

            addSection(document, h2, "六、重金属污染");
            String risk = classifyCadmiumRisk(crop.getLandUseType(), soil.getPh(), soil.getCadmium());
            addText(document, body, "镉含量为 " + fmt(soil.getCadmium()) + " mg/kg，按当前 pH 与土地利用类型判定为：" + risk + "。");
            addTable(document, bold, body, new String[][]{
                    {"物资", "镉钝化调理剂"},
                    {"建议", "低风险以监测为主；高风险及严管控建议分区施用钝化材料并复检。"}
            });

            addSection(document, h2, "七、后续化肥使用建议");
            if (economic != null && economic.getFertilizerAmount() != null) {
                addText(document, body, "改良前常规化肥用量为 " + fmt(economic.getFertilizerAmount()) + " 吨，建议在保障产量的前提下降低 10%-20%，并优先采用有机肥替代。");
            } else {
                addText(document, body, "暂无该农场改良前常规化肥用量数据，建议补录经济指标后细化减量方案。");
            }

            document.close();
            return file;
        } catch (Exception e) {
            throw new IllegalStateException("AI改良方案 PDF 生成失败：" + e.getMessage(), e);
        }
    }

    private void addSection(Document document, Font font, String text) throws Exception {
        Paragraph p = new Paragraph(text, font);
        p.setSpacingBefore(10);
        p.setSpacingAfter(6);
        document.add(p);
    }

    private void addText(Document document, Font font, String text) throws Exception {
        Paragraph p = new Paragraph(text, font);
        p.setFirstLineIndent(20);
        p.setLeading(18);
        document.add(p);
    }

    private void addTable(Document document, Font head, Font body, String[][] rows) throws Exception {
        PdfPTable table = new PdfPTable(rows[0].length);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5);
        table.setSpacingAfter(8);
        for (int i = 0; i < rows.length; i++) {
            for (String val : rows[i]) {
                PdfPCell cell = new PdfPCell(new Phrase(nz(val), i == 0 ? head : body));
                cell.setPadding(6);
                table.addCell(cell);
            }
        }
        document.add(table);
    }

    private String resolveFontPath() {
        String[] candidates = {
                configuredFontPath,
                "C:/Windows/Fonts/msyh.ttc,0",
                "C:/Windows/Fonts/simsun.ttc,0",
                "C:/Windows/Fonts/simhei.ttf"
        };
        for (String candidate : candidates) {
            if (!StringUtils.hasText(candidate)) continue;
            String path = candidate.split(",")[0];
            if (new File(path).exists()) return candidate;
        }
        return BaseFont.HELVETICA;
    }

    private String classifyCadmiumRisk(String landUseType, BigDecimal ph, BigDecimal cadmium) {
        if (ph == null || cadmium == null) return "暂无数据";
        double p = ph.doubleValue();
        BigDecimal highLine = "水田".equals(landUseType)
                ? (p <= 5.5 ? new BigDecimal("0.3") : p <= 6.5 ? new BigDecimal("0.43") : p <= 7.5 ? new BigDecimal("0.6") : new BigDecimal("0.8"))
                : new BigDecimal("0.3");
        BigDecimal strictLine = p <= 5.5 ? new BigDecimal("1.5") : p <= 6.5 ? new BigDecimal("2.0") : p <= 7.5 ? new BigDecimal("3.0") : new BigDecimal("4.0");
        if (cadmium.compareTo(strictLine) >= 0) return "严管控";
        if (cadmium.compareTo(highLine) >= 0) return "高风险";
        return "低风险";
    }

    private String calcDose(BigDecimal gap, BigDecimal factor) {
        return gap.max(BigDecimal.ZERO).multiply(factor).setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private String fmt(BigDecimal value) {
        return value == null ? "暂无数据" : value.stripTrailingZeros().toPlainString();
    }

    private String nz(String value) {
        return StringUtils.hasText(value) ? value : "暂无数据";
    }

    private String safeName(String value) {
        return nz(value).replaceAll("[\\\\/:*?\"<>|\\s]+", "");
    }
}
