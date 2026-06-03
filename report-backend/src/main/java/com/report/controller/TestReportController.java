package com.report.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.report.common.Result;
import com.report.entity.TestReport;
import com.report.mapper.TestReportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

import java.util.List;

@RestController
@RequestMapping("/test-report")
public class TestReportController {

    @Autowired
    private TestReportMapper testReportMapper;

    @GetMapping("/page")
    public Result<Page<TestReport>> getPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        Page<TestReport> page = new Page<>(current, size);
        LambdaQueryWrapper<TestReport> queryWrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            queryWrapper.like(TestReport::getFarmName, keyword)
                    .or().like(TestReport::getFarmCode, keyword);
        }
        queryWrapper.orderByDesc(TestReport::getCreatedAt);
        return Result.success(testReportMapper.selectPage(page, queryWrapper));
    }

    @PostMapping
    public Result<String> add(@RequestBody TestReport testReport) {
        testReportMapper.insert(testReport);
        return Result.success("新增成功");
    }

    @PostMapping("/update")
    public Result<String> update(@RequestBody TestReport testReport) {
        testReportMapper.updateById(testReport);
        return Result.success("修改成功");
    }

    @PostMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        testReportMapper.deleteById(id);
        return Result.success("删除成功");
    }

    @PostMapping("/delete/batch")
    public Result<String> batchDelete(@RequestBody List<Long> ids) {
        testReportMapper.deleteBatchIds(ids);
        return Result.success("批量删除成功");
    }
}

