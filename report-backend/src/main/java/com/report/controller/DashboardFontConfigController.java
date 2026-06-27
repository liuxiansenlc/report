package com.report.controller;

import com.report.common.Result;
import com.report.entity.DashboardFontConfig;
import com.report.mapper.DashboardFontConfigMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Date;

@RestController
@RequestMapping("/dashboard-font-config")
public class DashboardFontConfigController {

    private static final BigDecimal DEFAULT_SCALE = BigDecimal.ONE;

    @Autowired
    private DashboardFontConfigMapper mapper;

    @GetMapping
    public Result<DashboardFontConfig> getConfig() {
        return Result.success(loadOrCreate());
    }

    @PostMapping
    public Result<DashboardFontConfig> saveConfig(@RequestBody DashboardFontConfig input) {
        DashboardFontConfig config = loadOrCreate();
        config.setGlobalScale(normalize(input.getGlobalScale()));
        config.setHeaderScale(normalize(input.getHeaderScale()));
        config.setLeftScale(normalize(input.getLeftScale()));
        config.setCenterScale(normalize(input.getCenterScale()));
        config.setRightScale(normalize(input.getRightScale()));
        config.setAnalysisScale(normalize(input.getAnalysisScale()));
        config.setChartScale(normalize(input.getChartScale()));
        config.setOverlayScale(normalize(input.getOverlayScale()));
        config.setUpdatedAt(new Date());
        mapper.updateById(config);
        return Result.success(config);
    }

    private DashboardFontConfig loadOrCreate() {
        DashboardFontConfig config = mapper.selectById(1L);
        if (config != null) {
            fillDefaults(config);
            return config;
        }
        config = new DashboardFontConfig();
        config.setId(1L);
        fillDefaults(config);
        Date now = new Date();
        config.setCreatedAt(now);
        config.setUpdatedAt(now);
        mapper.insert(config);
        return config;
    }

    private void fillDefaults(DashboardFontConfig config) {
        config.setGlobalScale(normalize(config.getGlobalScale()));
        config.setHeaderScale(normalize(config.getHeaderScale()));
        config.setLeftScale(normalize(config.getLeftScale()));
        config.setCenterScale(normalize(config.getCenterScale()));
        config.setRightScale(normalize(config.getRightScale()));
        config.setAnalysisScale(normalize(config.getAnalysisScale()));
        config.setChartScale(normalize(config.getChartScale()));
        config.setOverlayScale(normalize(config.getOverlayScale()));
    }

    private BigDecimal normalize(BigDecimal value) {
        if (value == null) return DEFAULT_SCALE;
        BigDecimal min = new BigDecimal("0.75");
        BigDecimal max = new BigDecimal("1.35");
        if (value.compareTo(min) < 0) return min;
        if (value.compareTo(max) > 0) return max;
        return value;
    }
}
