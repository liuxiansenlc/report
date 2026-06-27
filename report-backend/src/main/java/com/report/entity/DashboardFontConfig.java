package com.report.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("dashboard_font_config")
public class DashboardFontConfig {
    @TableId(type = IdType.AUTO)
    private Long id;

    private BigDecimal globalScale;
    private BigDecimal headerScale;
    private BigDecimal leftScale;
    private BigDecimal centerScale;
    private BigDecimal rightScale;
    private BigDecimal analysisScale;
    private BigDecimal chartScale;
    private BigDecimal overlayScale;

    private Date createdAt;
    private Date updatedAt;
}
