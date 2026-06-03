package com.report.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.report.common.Result;
import com.report.entity.FarmInfo;
import com.report.mapper.FarmInfoMapper;
import com.report.listener.FarmInfoListener;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.read.metadata.ReadSheet;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/farm-info")
@CrossOrigin(origins = "*")
public class FarmInfoController {

    @Autowired
    private FarmInfoMapper farmInfoMapper;

    @GetMapping("/page")
    public Result<Page<FarmInfo>> getPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        
        Page<FarmInfo> page = new Page<>(current, size);
        QueryWrapper<FarmInfo> queryWrapper = new QueryWrapper<>();
        
        if (StringUtils.hasText(keyword)) {
            queryWrapper.like("farm_name", keyword)
                        .or()
                        .like("farm_code", keyword)
                        .or()
                        .like("farmer_name", keyword);
        }
        queryWrapper.orderByDesc("created_at");
        
        Page<FarmInfo> resultPage = farmInfoMapper.selectPage(page, queryWrapper);
        return Result.success(resultPage);
    }

    @PostMapping
    public Result<?> save(@RequestBody FarmInfo farmInfo) {
        farmInfoMapper.insert(farmInfo);
        return Result.success("新增成功", null);
    }

    @PostMapping("/update")
    public Result<String> update(@RequestBody FarmInfo farmInfo) {
        farmInfoMapper.updateById(farmInfo);
        return Result.success("修改成功");
    }

    @PostMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        farmInfoMapper.deleteById(id);
        return Result.success("删除成功");
    }

    @PostMapping("/delete/batch")
    public Result<String> batchDelete(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Result.error(400, "请选择要删除的记录！");
        }
        farmInfoMapper.deleteBatchIds(ids);
        return Result.success("批量删除成功");
    }

    private void setupExcelResponse(HttpServletResponse response, String fileName) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + encodedFileName + ".xlsx");
    }

    @GetMapping("/export")
    public void exportData(HttpServletResponse response, @RequestParam(required = false) String keyword) throws IOException {
        setupExcelResponse(response, "农场基础信息导出");
        QueryWrapper<FarmInfo> queryWrapper = new QueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            queryWrapper.like("farm_name", keyword).or().like("farm_code", keyword).or().like("farmer_name", keyword);
        }
        queryWrapper.orderByDesc("created_at");
        List<FarmInfo> list = farmInfoMapper.selectList(queryWrapper);
        EasyExcel.write(response.getOutputStream(), FarmInfo.class).sheet("农场信息").doWrite(list);
    }

    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        setupExcelResponse(response, "农场基础信息");
        // 返回一个空列表提供模板结构
        EasyExcel.write(response.getOutputStream(), FarmInfo.class).sheet("模板").doWrite(new ArrayList<>());
    }

    @PostMapping("/sheets")
    public Result<List<Map<String, Object>>> getSheets(MultipartFile file) {
        try {
            List<ReadSheet> sheets = EasyExcel.read(file.getInputStream()).build().excelExecutor().sheetList();
            List<Map<String, Object>> result = new ArrayList<>();
            for (ReadSheet sheet : sheets) {
                Map<String, Object> map = new HashMap<>();
                map.put("no", sheet.getSheetNo());
                map.put("name", sheet.getSheetName());
                result.add(map);
            }
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, "解析表单信息失败！");
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
                public void doAfterAllAnalysed(AnalysisContext context) {
                }
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
            EasyExcel.read(file.getInputStream(), FarmInfo.class, new FarmInfoListener(farmInfoMapper)).sheet(sheetNo).doRead();
            return Result.success("导入成功，重复编号已自动跳过！", null);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, "文件导入失败，请检查模板格式！");
        }
    }
}

