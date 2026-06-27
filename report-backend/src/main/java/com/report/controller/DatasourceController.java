package com.report.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.report.common.Result;
import com.report.entity.*;
import com.report.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/datasource")
@CrossOrigin(origins = "*")
public class DatasourceController {

    @Autowired
    private FarmInfoMapper farmInfoMapper;

    @Autowired
    private CropPhStandardMapper cropPhStandardMapper;

    @Autowired
    private SoilTestDataMapper soilTestDataMapper;

    @Autowired
    private EconomicIndicatorMapper economicIndicatorMapper;

    @Autowired
    private TestReportMapper testReportMapper;

    @Autowired
    private ServiceStationMapper serviceStationMapper;

    @Autowired
    private FactoryInfoMapper factoryInfoMapper;

    @PostMapping("/farm-info")
    public Result<List<FarmInfo>> getFarmInfo(@RequestBody Map<String, Object> params) {
        QueryWrapper<FarmInfo> queryWrapper = new QueryWrapper<>();
        
        if (params != null) {
            Object id = params.get("id");
            Object farmName = params.get("farmName");
            
            if (id != null && StringUtils.hasText(id.toString())) {
                queryWrapper.eq("id", id);
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                queryWrapper.like("farm_name", farmName.toString());
            }
        }
        
        queryWrapper.orderByDesc("created_at");
        List<FarmInfo> list = farmInfoMapper.selectList(queryWrapper);
        return Result.success(list);
    }
    
    @PostMapping("/organic-matter")
    public Result<List<Map<String, Object>>> getOrganicMatter(@RequestBody Map<String, Object> params) {
        QueryWrapper<SoilTestData> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("organic_matter", "type");
        
        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");
            
            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                queryWrapper.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                queryWrapper.like("farm_name", farmName.toString());
            }
        }
        
        queryWrapper.orderByDesc("created_at");
        List<Map<String, Object>> list = soilTestDataMapper.selectMaps(queryWrapper);
        return Result.success(list);
    }

    @PostMapping("/microbial-cn-ratio")
    public Result<List<Map<String, Object>>> getMicrobialCnRatio(@RequestBody Map<String, Object> params) {
        QueryWrapper<SoilTestData> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("microbial_carbon", "microbial_nitrogen", "type");
        
        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");
            
            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                queryWrapper.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                queryWrapper.like("farm_name", farmName.toString());
            }
        }
        
        queryWrapper.orderByDesc("created_at");
        List<Map<String, Object>> list = soilTestDataMapper.selectMaps(queryWrapper);
        return Result.success(list);
    }

    /**
     * 微生物量碳接口：返回改良前后的微生物碳原始值，增幅由前端自行计算
     */
    @PostMapping("/microbial-biomass-carbon")
    public Result<Map<String, Object>> getMicrobialBiomassCarbon(@RequestBody Map<String, Object> params) {
        QueryWrapper<SoilTestData> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("microbial_carbon", "microbial_nitrogen", "type");

        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");

            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                queryWrapper.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                queryWrapper.like("farm_name", farmName.toString());
            }
        }

        queryWrapper.orderByDesc("created_at");
        List<Map<String, Object>> list = soilTestDataMapper.selectMaps(queryWrapper);

        // 结构化：找改良前/改良后两条记录，提取碳氮值返回给前端
        Map<String, Object> result = new HashMap<>();
        double beforeCarbon = 0.0, afterCarbon = 0.0;
        double beforeNitrogen = 0.0, afterNitrogen = 0.0;

        for (Map<String, Object> row : list) {
            String type = row.get("type") != null ? row.get("type").toString() : "";
            double carbon = row.get("microbial_carbon") != null
                    ? Double.parseDouble(row.get("microbial_carbon").toString()) : 0.0;
            double nitrogen = row.get("microbial_nitrogen") != null
                    ? Double.parseDouble(row.get("microbial_nitrogen").toString()) : 0.0;
            if (type.contains("前")) {
                beforeCarbon = carbon;
                beforeNitrogen = nitrogen;
            } else if (type.contains("后")) {
                afterCarbon = carbon;
                afterNitrogen = nitrogen;
            }
        }

        result.put("beforeCarbon", beforeCarbon);
        result.put("afterCarbon", afterCarbon);
        result.put("beforeNitrogen", beforeNitrogen);
        result.put("afterNitrogen", afterNitrogen);
        return Result.success(result);
    }

    @PostMapping("/soil-level")
    public Result<List<Map<String, Object>>> getSoilLevel(@RequestBody Map<String, Object> params) {
        QueryWrapper<SoilTestData> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("level", "type");
        
        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");
            
            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                queryWrapper.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                queryWrapper.like("farm_name", farmName.toString());
            }
        }
        
        queryWrapper.orderByDesc("created_at");
        List<Map<String, Object>> list = soilTestDataMapper.selectMaps(queryWrapper);
        return Result.success(list);
    }

    @PostMapping("/npk-elements")
    public Result<List<Map<String, Object>>> getNpkElements(@RequestBody Map<String, Object> params) {
        QueryWrapper<SoilTestData> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("hydro_nitrogen", "avail_phosphorus", "avail_potassium", "type");
        
        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");
            
            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                queryWrapper.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                queryWrapper.like("farm_name", farmName.toString());
            }
        }
        
        queryWrapper.orderByDesc("created_at");
        List<Map<String, Object>> list = soilTestDataMapper.selectMaps(queryWrapper);
        return Result.success(list);
    }

    @PostMapping("/trace-elements")
    public Result<List<Map<String, Object>>> getTraceElements(@RequestBody Map<String, Object> params) {
        QueryWrapper<SoilTestData> queryWrapper = new QueryWrapper<>();
        // Select available calcium, magnesium, boron (and sulfur as fallback for silicon if needed)
        queryWrapper.select("avail_calcium", "avail_magnesium", "avail_boron", "avail_sulfur", "type");
        
        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");
            
            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                queryWrapper.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                queryWrapper.like("farm_name", farmName.toString());
            }
        }
        
        queryWrapper.orderByDesc("created_at");
        List<Map<String, Object>> list = soilTestDataMapper.selectMaps(queryWrapper);
        return Result.success(list);
    }

    @PostMapping("/cadmium-content")
    public Result<List<Map<String, Object>>> getCadmiumContent(@RequestBody Map<String, Object> params) {
        QueryWrapper<SoilTestData> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("cadmium", "avail_cadmium", "type");
        
        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");
            
            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                queryWrapper.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                queryWrapper.like("farm_name", farmName.toString());
            }
        }
        
        queryWrapper.orderByDesc("created_at");
        List<Map<String, Object>> list = soilTestDataMapper.selectMaps(queryWrapper);
        return Result.success(list);
    }

    @PostMapping("/cadmium-risk")
    public Result<Map<String, Object>> getCadmiumRisk(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        result.put("riskLevel", "低风险");
        result.put("ph", null);
        result.put("cadmium", null);

        if (params == null || params.get("farmCode") == null) {
            return Result.success(result);
        }
        String farmCode = params.get("farmCode").toString();

        // 1. Get farm info
        QueryWrapper<FarmInfo> farmQw = new QueryWrapper<>();
        farmQw.eq("farm_code", farmCode);
        farmQw.last("LIMIT 1");
        FarmInfo farmInfo = farmInfoMapper.selectOne(farmQw);
        if (farmInfo == null || !StringUtils.hasText(farmInfo.getCropVariety())) {
            return Result.success(result);
        }

        // 2. Get land use type
        QueryWrapper<CropPhStandard> cropQw = new QueryWrapper<>();
        cropQw.eq("crop_name", farmInfo.getCropVariety());
        cropQw.last("LIMIT 1");
        CropPhStandard cropPhStandard = cropPhStandardMapper.selectOne(cropQw);
        if (cropPhStandard == null || !StringUtils.hasText(cropPhStandard.getLandUseType())) {
            return Result.success(result);
        }
        String landUseType = cropPhStandard.getLandUseType();

        // 3. Get soil test data (改良后)
        QueryWrapper<SoilTestData> soilQw = new QueryWrapper<>();
        soilQw.eq("farm_code", farmCode);
        soilQw.eq("type", "改良后");
        soilQw.orderByDesc("created_at");
        soilQw.last("LIMIT 1");
        SoilTestData soilTestData = soilTestDataMapper.selectOne(soilQw);
        if (soilTestData == null) {
            return Result.success(result);
        }

        BigDecimal phDecimal = soilTestData.getPh();
        BigDecimal cadmiumDecimal = soilTestData.getCadmium();

        if (phDecimal == null || cadmiumDecimal == null) {
            return Result.success(result);
        }

        result.put("ph", phDecimal.doubleValue());
        result.put("cadmium", cadmiumDecimal.doubleValue());
        String riskKey = classifyCadmiumRiskKey(landUseType, phDecimal, cadmiumDecimal);
        result.put("riskKey", riskKey);
        result.put("riskLevel", cadmiumRiskLabel(riskKey));
        return Result.success(result);
    }

    @PostMapping("/ph-match")
    public Result<Map<String, Object>> getPhMatch(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new java.util.HashMap<>();
        
        // 1. 获取作物理想PH范围
        if (params != null && params.get("cropName") != null) {
            String cropName = params.get("cropName").toString();
            QueryWrapper<CropPhStandard> cropQw = new QueryWrapper<>();
            cropQw.select("ph_min", "ph_max").eq("crop_name", cropName).last("limit 1");
            CropPhStandard crop = cropPhStandardMapper.selectOne(cropQw);
            if (crop != null) {
                result.put("phMin", crop.getPhMin());
                result.put("phMax", crop.getPhMax());
            }
        }
        // 如果未查到或者没传，给前端一个假兜底，或空
        result.putIfAbsent("phMin", 3.0);
        result.putIfAbsent("phMax", 4.5);
        
        // 2. 获取该农场的PH数据
        QueryWrapper<SoilTestData> soilQw = new QueryWrapper<>();
        soilQw.select("ph", "type");
        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");
            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                soilQw.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                soilQw.like("farm_name", farmName.toString());
            }
        }
        soilQw.orderByDesc("created_at");
        List<Map<String, Object>> soilList = soilTestDataMapper.selectMaps(soilQw);
        result.put("soilData", soilList);
        
        return Result.success(result);
    }

    /**
     * 首页总览聚合接口：跨所有农场求均值
     * 指标：ph、organic_matter、avail_potassium（保水能力）、
     *       hydro_nitrogen（养分状况）、active_organic_matter（生物多样性）
     * 改良前/改良后分别汇总后取平均，改良幅度由前端自行计算
     */
    @PostMapping("/dashboard-overview")
    public Result<Map<String, Object>> getDashboardOverview(@RequestBody(required = false) Map<String, Object> params) {
        QueryWrapper<SoilTestData> qw = new QueryWrapper<>();
        qw.select("type", "ph", "organic_matter",
                "avail_potassium", "hydro_nitrogen", "active_organic_matter", "avail_phosphorus");
        qw.isNotNull("type");
        List<Map<String, Object>> list = soilTestDataMapper.selectMaps(qw);

        // 累加器：before / after 各自的 sum 与 count
        double[] phSum = {0, 0};
        double[] omSum = {0, 0};
        double[] potSum = {0, 0};
        double[] nitSum = {0, 0};
        double[] aomSum = {0, 0};
        double[] phoSum = {0, 0};
        int[] bCnt = {0};
        int[] aCnt = {0};

        for (Map<String, Object> row : list) {
            String type = row.get("type") != null ? row.get("type").toString() : "";
            boolean isBefore = type.contains("\u524d");   // 改良前
            boolean isAfter  = type.contains("\u540e");   // 改良后
            if (!isBefore && !isAfter) continue;

            double ph  = row.get("ph")  != null ? Double.parseDouble(row.get("ph").toString())  : 0;
            double om  = row.get("organic_matter")  != null ? Double.parseDouble(row.get("organic_matter").toString())  : 0;
            double pot = row.get("avail_potassium") != null ? Double.parseDouble(row.get("avail_potassium").toString()) : 0;
            double nit = row.get("hydro_nitrogen")  != null ? Double.parseDouble(row.get("hydro_nitrogen").toString())  : 0;
            double aom = row.get("active_organic_matter") != null ? Double.parseDouble(row.get("active_organic_matter").toString()) : 0;
            double pho = row.get("avail_phosphorus") != null ? Double.parseDouble(row.get("avail_phosphorus").toString()) : 0;

            if (isBefore) {
                phSum[0] += ph;  omSum[0] += om;  potSum[0] += pot;
                nitSum[0] += nit; aomSum[0] += aom; phoSum[0] += pho;
                bCnt[0]++;
            } else {
                phSum[1] += ph;  omSum[1] += om;  potSum[1] += pot;
                nitSum[1] += nit; aomSum[1] += aom; phoSum[1] += pho;
                aCnt[0]++;
            }
        }

        int b = bCnt[0] > 0 ? bCnt[0] : 1;
        int a = aCnt[0] > 0 ? aCnt[0] : 1;

        // 精度保留 2 位小数
        java.util.function.Function<Double, Double> r2 = v -> Math.round(v * 100.0) / 100.0;

        Map<String, Object> result = new HashMap<>();

        // 农作物适应性(酸碱度) — ph
        Map<String, Object> phData = new HashMap<>();
        phData.put("before", r2.apply(phSum[0] / b));
        phData.put("after",  r2.apply(phSum[1] / a));
        result.put("ph", phData);

        // 有机质
        Map<String, Object> omData = new HashMap<>();
        omData.put("before", r2.apply(omSum[0] / b));
        omData.put("after",  r2.apply(omSum[1] / a));
        result.put("organicMatter", omData);

        // 养分情况 — 保水能力(avail_potassium)
        Map<String, Object> potData = new HashMap<>();
        potData.put("before", r2.apply(potSum[0] / b));
        potData.put("after",  r2.apply(potSum[1] / a));
        result.put("waterRetention", potData);

        // 养分情况 — 养分状况(hydro_nitrogen)
        Map<String, Object> nitData = new HashMap<>();
        nitData.put("before", r2.apply(nitSum[0] / b));
        nitData.put("after",  r2.apply(nitSum[1] / a));
        result.put("nutrientStatus", nitData);

        // 养分情况 — 生物多样性(active_organic_matter)
        Map<String, Object> aomData = new HashMap<>();
        aomData.put("before", r2.apply(aomSum[0] / b));
        aomData.put("after",  r2.apply(aomSum[1] / a));
        result.put("biodiversity", aomData);

        // 养分情况 — 水解氮
        Map<String, Object> hnData = new HashMap<>();
        hnData.put("before", r2.apply(nitSum[0] / b));
        hnData.put("after",  r2.apply(nitSum[1] / a));
        result.put("hydroNitrogen", hnData);

        // 养分情况 — 有效磷
        Map<String, Object> apData = new HashMap<>();
        apData.put("before", r2.apply(phoSum[0] / b));
        apData.put("after",  r2.apply(phoSum[1] / a));
        result.put("availPhosphorus", apData);

        // 养分情况 — 速效钾
        Map<String, Object> akData = new HashMap<>();
        akData.put("before", r2.apply(potSum[0] / b));
        akData.put("after",  r2.apply(potSum[1] / a));
        result.put("availPotassium", akData);

        return Result.success(result);
    }

    @PostMapping("/economic-benefits")
    public Result<Map<String, Object>> getEconomicBenefits() {
        // Query all records
        List<EconomicIndicator> allRecords = economicIndicatorMapper.selectList(new QueryWrapper<>());

        // Group by farmCode
        Map<String, List<EconomicIndicator>> groupedByFarm = allRecords.stream()
                .filter(r -> StringUtils.hasText(r.getFarmCode()))
                .collect(Collectors.groupingBy(EconomicIndicator::getFarmCode));

        BigDecimal totalFertilizerReduction = BigDecimal.ZERO;
        BigDecimal totalYieldIncrease = BigDecimal.ZERO;
        BigDecimal totalRevenueIncrease = BigDecimal.ZERO;

        for (Map.Entry<String, List<EconomicIndicator>> entry : groupedByFarm.entrySet()) {
            List<EconomicIndicator> records = entry.getValue();
            EconomicIndicator before = null;
            EconomicIndicator after = null;

            for (EconomicIndicator record : records) {
                if ("改良前".equals(record.getType())) {
                    before = record;
                } else if ("改良后".equals(record.getType())) {
                    after = record;
                }
            }

            // Only process if both records exist for the farm
            if (before != null && after != null) {
                BigDecimal beforeFert = before.getFertilizerAmount() != null ? before.getFertilizerAmount() : BigDecimal.ZERO;
                BigDecimal afterFert = after.getFertilizerAmount() != null ? after.getFertilizerAmount() : BigDecimal.ZERO;
                BigDecimal beforeYield = before.getCropYield() != null ? before.getCropYield() : BigDecimal.ZERO;
                BigDecimal afterYield = after.getCropYield() != null ? after.getCropYield() : BigDecimal.ZERO;
                BigDecimal beforeRev = before.getRevenue() != null ? before.getRevenue() : BigDecimal.ZERO;
                BigDecimal afterRev = after.getRevenue() != null ? after.getRevenue() : BigDecimal.ZERO;

                // 化肥用量 (Before - After)
                totalFertilizerReduction = totalFertilizerReduction.add(beforeFert.subtract(afterFert));
                // 农作产量 (After - Before)
                totalYieldIncrease = totalYieldIncrease.add(afterYield.subtract(beforeYield));
                // 收益 (After - Before)
                totalRevenueIncrease = totalRevenueIncrease.add(afterRev.subtract(beforeRev));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("fertilizerReduction", totalFertilizerReduction);
        result.put("yieldIncrease", totalYieldIncrease);
        result.put("revenueIncrease", totalRevenueIncrease);

        return Result.success(result);
    }

    @PostMapping("/improvement-plan")
    public Result<List<Map<String, Object>>> getImprovementPlan(@RequestBody(required = false) Map<String, Object> params) {
        QueryWrapper<TestReport> qw = new QueryWrapper<>();
        if (params != null) {
            Object farmCode = params.get("farmCode");
            Object farmName = params.get("farmName");
            if (farmCode != null && StringUtils.hasText(farmCode.toString())) {
                qw.eq("farm_code", farmCode.toString());
            }
            if (farmName != null && StringUtils.hasText(farmName.toString())) {
                qw.like("farm_name", farmName.toString());
            }
        }
        qw.orderByDesc("report_date");
        List<TestReport> list = testReportMapper.selectList(qw);

        // Group by farmCode/farmName to create the cards
        Map<String, Map<String, Object>> farmGroup = new LinkedHashMap<>();
        for (TestReport report : list) {
            String key = report.getFarmCode();
            Map<String, Object> card = farmGroup.computeIfAbsent(key, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("farmCode", report.getFarmCode());
                m.put("name", report.getFarmName());
                m.put("date", report.getReportDate() != null ? 
                    new java.text.SimpleDateFormat("yyyy-MM-dd").format(report.getReportDate()) : "");
                return m;
            });
            
            if ("改良前检测报告".equals(report.getReportType()) && !card.containsKey("beforeUrl")) {
                card.put("beforeUrl", report.getFileUrl());
            } else if ("改良后检测报告".equals(report.getReportType()) && !card.containsKey("afterUrl")) {
                card.put("afterUrl", report.getFileUrl());
            } else if ("改良方案".equals(report.getReportType())) {
                boolean reportVisible = report.getFrontendVisible() == null || report.getFrontendVisible() == 1;
                boolean currentVisible = Boolean.TRUE.equals(card.get("planFrontendVisible"));
                if (!card.containsKey("planUrl") || (reportVisible && !currentVisible)) {
                    card.put("planUrl", report.getFileUrl());
                    card.put("planFileName", report.getFileName());
                    card.put("planSource", StringUtils.hasText(report.getReportSource()) ? report.getReportSource() : "MANUAL");
                    card.put("planFrontendVisible", reportVisible);
                }
            }
        }

        return Result.success(new ArrayList<>(farmGroup.values()));
    }

    @PostMapping("/cadmium-risk-distribution")
    public Result<Map<String, Object>> getCadmiumRiskDistribution(@RequestBody(required = false) Map<String, Object> params) {
        List<FarmInfo> farms = farmInfoMapper.selectList(new QueryWrapper<FarmInfo>());
        Map<String, FarmInfo> farmMap = farms.stream()
                .filter(f -> StringUtils.hasText(f.getFarmCode()))
                .collect(Collectors.toMap(FarmInfo::getFarmCode, f -> f, (a, b) -> a, LinkedHashMap::new));

        Map<String, String> cropLandUseMap = cropPhStandardMapper.selectList(new QueryWrapper<CropPhStandard>())
                .stream()
                .filter(c -> StringUtils.hasText(c.getCropName()))
                .collect(Collectors.toMap(CropPhStandard::getCropName, c -> c.getLandUseType(), (a, b) -> a));

        QueryWrapper<SoilTestData> qw = new QueryWrapper<>();
        qw.isNotNull("farm_code").isNotNull("type").isNotNull("ph").isNotNull("cadmium");
        qw.orderByDesc("created_at").orderByDesc("id");
        List<SoilTestData> soils = soilTestDataMapper.selectList(qw);

        Map<String, SoilTestData> latest = new LinkedHashMap<>();
        for (SoilTestData soil : soils) {
            String stage = stageKey(soil.getType());
            if (stage == null || !farmMap.containsKey(soil.getFarmCode())) continue;
            latest.putIfAbsent(stage + ":" + soil.getFarmCode(), soil);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("before", buildCadmiumRiskStage("before", latest, farmMap, cropLandUseMap));
        data.put("after", buildCadmiumRiskStage("after", latest, farmMap, cropLandUseMap));
        return Result.success(data);
    }

    @GetMapping("/service-stations")
    public Result<List<Map<String, Object>>> getServiceStations() {
        QueryWrapper<ServiceStation> qw = new QueryWrapper<>();
        qw.select("name", "longitude", "latitude", "address");
        qw.isNotNull("longitude").isNotNull("latitude");
        List<ServiceStation> list = serviceStationMapper.selectList(qw);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ServiceStation s : list) {
            try {
                double lon = Double.parseDouble(s.getLongitude());
                double lat = Double.parseDouble(s.getLatitude());
                Map<String, Object> item = new HashMap<>();
                item.put("lon", lon);
                item.put("lat", lat);
                item.put("name", s.getName());
                item.put("address", s.getAddress());
                result.add(item);
            } catch (NumberFormatException ignored) {}
        }
        return Result.success(result);
    }

    @GetMapping("/factories")
    public Result<List<Map<String, Object>>> getFactories() {
        QueryWrapper<FactoryInfo> qw = new QueryWrapper<>();
        qw.select("name", "longitude", "latitude", "address");
        qw.isNotNull("longitude").isNotNull("latitude");
        List<FactoryInfo> list = factoryInfoMapper.selectList(qw);
        List<Map<String, Object>> result = new ArrayList<>();
        for (FactoryInfo f : list) {
            try {
                double lon = Double.parseDouble(f.getLongitude());
                double lat = Double.parseDouble(f.getLatitude());
                Map<String, Object> item = new HashMap<>();
                item.put("lon", lon);
                item.put("lat", lat);
                item.put("name", f.getName());
                item.put("address", f.getAddress());
                result.add(item);
            } catch (NumberFormatException ignored) {}
        }
        return Result.success(result);
    }

    private Map<String, Object> buildCadmiumRiskStage(String stage, Map<String, SoilTestData> latest,
                                                       Map<String, FarmInfo> farmMap, Map<String, String> cropLandUseMap) {
        Map<String, List<Map<String, Object>>> groups = new LinkedHashMap<>();
        groups.put("low", new ArrayList<>());
        groups.put("high", new ArrayList<>());
        groups.put("strict", new ArrayList<>());

        for (FarmInfo farm : farmMap.values()) {
            SoilTestData soil = latest.get(stage + ":" + farm.getFarmCode());
            if (soil == null || soil.getPh() == null || soil.getCadmium() == null) continue;
            String landUseType = cropLandUseMap.get(farm.getCropVariety());
            String riskKey = classifyCadmiumRiskKey(landUseType, soil.getPh(), soil.getCadmium());
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("farmCode", farm.getFarmCode());
            item.put("farmName", farm.getFarmName());
            item.put("farmArea", farm.getFarmArea());
            item.put("cropVariety", farm.getCropVariety());
            item.put("landUseType", landUseType);
            item.put("ph", soil.getPh());
            item.put("cadmium", soil.getCadmium());
            item.put("riskKey", riskKey);
            item.put("riskLevel", cadmiumRiskLabel(riskKey));
            groups.get(riskKey).add(item);
        }

        int total = groups.values().stream().mapToInt(List::size).sum();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        for (Map.Entry<String, List<Map<String, Object>>> entry : groups.entrySet()) {
            Map<String, Object> group = new LinkedHashMap<>();
            int count = entry.getValue().size();
            group.put("count", count);
            group.put("rate", total == 0 ? 0 : Math.round(count * 1000.0 / total) / 10.0);
            group.put("farms", entry.getValue());
            result.put(entry.getKey(), group);
        }
        return result;
    }

    private String stageKey(String type) {
        if (!StringUtils.hasText(type)) return null;
        if (type.contains("前")) return "before";
        if (type.contains("后")) return "after";
        return null;
    }

    private String classifyCadmiumRiskKey(String landUseType, BigDecimal ph, BigDecimal cadmium) {
        if (ph == null || cadmium == null) return "low";
        double p = ph.doubleValue();
        BigDecimal strictLine = p <= 5.5 ? new BigDecimal("1.5")
                : p <= 6.5 ? new BigDecimal("2.0")
                : p <= 7.5 ? new BigDecimal("3.0")
                : new BigDecimal("4.0");
        BigDecimal highLine;
        if ("水田".equals(landUseType)) {
            highLine = p <= 5.5 ? new BigDecimal("0.3")
                    : p <= 6.5 ? new BigDecimal("0.43")
                    : p <= 7.5 ? new BigDecimal("0.6")
                    : new BigDecimal("0.8");
        } else {
            highLine = new BigDecimal("0.3");
        }
        if (cadmium.compareTo(strictLine) >= 0) return "strict";
        if (cadmium.compareTo(highLine) >= 0) return "high";
        return "low";
    }

    private String cadmiumRiskLabel(String riskKey) {
        if ("strict".equals(riskKey)) return "严管控";
        if ("high".equals(riskKey)) return "高风险";
        return "低风险";
    }
}

