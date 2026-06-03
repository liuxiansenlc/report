package com.report.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.alibaba.excel.annotation.ExcelIgnore;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("economic_indicator")
public class EconomicIndicator {

    @TableId(type = IdType.AUTO)
    @ExcelIgnore
    private Long id;

    @ExcelProperty("农场编号")
    private String farmCode;

    @ExcelProperty("农场名称")
    private String farmName;

    @ExcelProperty("类型")
    private String type;

    @ExcelProperty("化肥用量（吨）")
    private BigDecimal fertilizerAmount;

    @ExcelProperty("农作产量（吨）")
    private BigDecimal cropYield;

    @ExcelProperty("单价（元/吨）")
    private BigDecimal unitPrice;

    @ExcelProperty("收益（万元）")
    private BigDecimal revenue;

    @ExcelIgnore
    private Date createdAt;

    @ExcelIgnore
    private Date updatedAt;
}
