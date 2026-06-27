package com.report.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.report.common.Result;
import com.report.entity.TestReport;
import com.report.mapper.TestReportMapper;
import com.report.service.AiImprovementPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/test-report")
public class TestReportController {

    private static final String REPORT_TYPE_PLAN = "改良方案";
    private static final String SOURCE_MANUAL = "MANUAL";

    @Autowired private TestReportMapper testReportMapper;
    @Autowired private AiImprovementPlanService aiImprovementPlanService;

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
        fillDefaults(testReport);
        testReportMapper.insert(testReport);
        applyFrontendSelection(testReport);
        return Result.success("新增成功");
    }

    @PostMapping("/update")
    public Result<String> update(@RequestBody TestReport testReport) {
        fillDefaults(testReport);
        testReportMapper.updateById(testReport);
        applyFrontendSelection(testReport);
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

    @PostMapping("/ai-plan/generate")
    public Result<TestReport> generateAiPlan(@RequestBody AiPlanGenerateRequest request) {
        try {
            TestReport report = aiImprovementPlanService.generate(
                    request.getFarmCode(),
                    request.getReportDate(),
                    request.getPathogenCount());
            return Result.success(report);
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PostMapping("/plan/display/{id}")
    public Result<String> setFrontendPlan(@PathVariable Long id) {
        TestReport report = testReportMapper.selectById(id);
        if (report == null) {
            return Result.error(404, "报告不存在");
        }
        if (!REPORT_TYPE_PLAN.equals(report.getReportType())) {
            return Result.error(400, "只有改良方案可以设置前端展示");
        }
        testReportMapper.update(null, new UpdateWrapper<TestReport>()
                .eq("farm_code", report.getFarmCode())
                .eq("report_type", REPORT_TYPE_PLAN)
                .set("frontend_visible", 0));
        testReportMapper.update(null, new UpdateWrapper<TestReport>()
                .eq("id", id)
                .set("frontend_visible", 1));
        return Result.success("设置成功");
    }

    private void fillDefaults(TestReport report) {
        if (!StringUtils.hasText(report.getReportSource())) {
            report.setReportSource(SOURCE_MANUAL);
        }
        if (report.getFrontendVisible() == null) {
            report.setFrontendVisible(1);
        }
        if (!REPORT_TYPE_PLAN.equals(report.getReportType())) {
            report.setFrontendVisible(1);
        }
    }

    private void applyFrontendSelection(TestReport report) {
        if (report.getId() == null
                || !REPORT_TYPE_PLAN.equals(report.getReportType())
                || report.getFrontendVisible() == null
                || report.getFrontendVisible() != 1) {
            return;
        }
        testReportMapper.update(null, new UpdateWrapper<TestReport>()
                .eq("farm_code", report.getFarmCode())
                .eq("report_type", REPORT_TYPE_PLAN)
                .ne("id", report.getId())
                .set("frontend_visible", 0));
    }

    public static class AiPlanGenerateRequest {
        private String farmCode;
        private java.util.Date reportDate;
        private BigDecimal pathogenCount;

        public String getFarmCode() {
            return farmCode;
        }

        public void setFarmCode(String farmCode) {
            this.farmCode = farmCode;
        }

        public java.util.Date getReportDate() {
            return reportDate;
        }

        public void setReportDate(java.util.Date reportDate) {
            this.reportDate = reportDate;
        }

        public BigDecimal getPathogenCount() {
            return pathogenCount;
        }

        public void setPathogenCount(BigDecimal pathogenCount) {
            this.pathogenCount = pathogenCount;
        }
    }
}
