package com.report.controller;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.report.common.Result;
import com.report.entity.SoilRiskStandard;
import com.report.listener.SoilRiskStandardListener;
import com.report.mapper.SoilRiskStandardMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/soil-risk-standard")
public class SoilRiskStandardController {

    @Autowired
    private SoilRiskStandardMapper soilRiskStandardMapper;

    @GetMapping("/page")
    public Result<Page<SoilRiskStandard>> getPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        
        Page<SoilRiskStandard> page = new Page<>(current, size);
        QueryWrapper<SoilRiskStandard> wrapper = new QueryWrapper<>();
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.like("indicator", keyword).or().like("risk_level", keyword);
        }
        wrapper.orderByDesc("created_at");
        soilRiskStandardMapper.selectPage(page, wrapper);
        return Result.success(page);
    }

    @PostMapping
    public Result<?> save(@RequestBody SoilRiskStandard entity) {
        soilRiskStandardMapper.insert(entity);
        return Result.success("新增成功", null);
    }

    @PostMapping("/update")
    public Result<String> update(@RequestBody SoilRiskStandard soilRiskStandard) {
        soilRiskStandardMapper.updateById(soilRiskStandard);
        return Result.success("修改成功");
    }

    @PostMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        soilRiskStandardMapper.deleteById(id);
        return Result.success("删除成功");
    }

    @PostMapping("/delete/batch")
    public Result<String> batchDelete(@RequestBody List<Long> ids) {
        soilRiskStandardMapper.deleteBatchIds(ids);
        return Result.success("批量删除成功", null);
    }

    @PostMapping("/sheets")
    public Result<List<Map<String, Object>>> getSheets(MultipartFile file) {
        try {
            List<Map<String, Object>> sheetList = new ArrayList<>();
            EasyExcel.read(file.getInputStream()).build().excelExecutor().sheetList().forEach(sheet -> {
                Map<String, Object> sheetMap = new HashMap<>();
                sheetMap.put("no", sheet.getSheetNo());
                sheetMap.put("name", sheet.getSheetName());
                sheetList.add(sheetMap);
            });
            return Result.success(sheetList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, "读取工作表失败！");
        }
    }

    @PostMapping("/preview")
    public Result<Map<String, Object>> previewData(MultipartFile file, @RequestParam(defaultValue = "0") Integer sheetNo) {
        try {
            Map<String, Object> resultMap = new HashMap<>();
            List<Map<Integer, String>> previewList = new ArrayList<>();
            Map<Integer, String> headerRecord = new HashMap<>();

            EasyExcel.read(file.getInputStream(), new AnalysisEventListener<Map<Integer, String>>() {
                @Override
                public void invokeHeadMap(Map<Integer, String> headMap, AnalysisContext context) {
                    headerRecord.putAll(headMap);
                }

                @Override
                public void invoke(Map<Integer, String> data, AnalysisContext context) {
                    if (previewList.size() < 10) {
                        previewList.add(data);
                    }
                }

                @Override
                public void doAfterAllAnalysed(AnalysisContext context) {}
            }).sheet(sheetNo).doRead();
            
            resultMap.put("headers", headerRecord);
            resultMap.put("rows", previewList);
            return Result.success(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, "预览数据失败！");
        }
    }

    @PostMapping("/import")
    public Result<?> importData(MultipartFile file, @RequestParam(defaultValue = "0") Integer sheetNo) {
        try {
            EasyExcel.read(file.getInputStream(), SoilRiskStandard.class, new SoilRiskStandardListener(soilRiskStandardMapper))
                     .sheet(sheetNo).doRead();
            return Result.success("导入成功", null);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, "导入失败: " + e.getMessage());
        }
    }

    @GetMapping("/export")
    public void exportData(HttpServletResponse response) throws IOException {
        setupExcelResponse(response, "重金属风险分级标准数据");
        List<SoilRiskStandard> list = soilRiskStandardMapper.selectList(new QueryWrapper<SoilRiskStandard>().orderByDesc("created_at"));
        EasyExcel.write(response.getOutputStream(), SoilRiskStandard.class).sheet("标准数据").doWrite(list);
    }

    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        setupExcelResponse(response, "重金属风险标准导入模板");
        List<SoilRiskStandard> emptyList = new ArrayList<>();
        EasyExcel.write(response.getOutputStream(), SoilRiskStandard.class).sheet("Sheet1").doWrite(emptyList);
    }

    private void setupExcelResponse(HttpServletResponse response, String fileName) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String encodedFileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + encodedFileName + ".xlsx");
    }
}

