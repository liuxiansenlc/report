package com.report.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.alibaba.excel.annotation.ExcelIgnore;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import java.util.Date;

@Data
@TableName("soil_risk_standard")
public class SoilRiskStandard {
    @TableId(type = IdType.AUTO)
    @ExcelIgnore
    private Long id;
    
    @ExcelProperty(value = "指标", index = 0)
    private String indicator;
    
    @ExcelProperty(value = "风险等级", index = 1)
    private String riskLevel;
    
    @ExcelProperty(value = "pH", index = 2)
    private String phRangeExpr;
    
    @ExcelProperty(value = "数值", index = 3)
    private String valueRangeExpr;
    
    @ExcelProperty(value = "土地利用类型", index = 4)
    private String landUseType;
    
    @ExcelIgnore
    @TableField(fill = FieldFill.INSERT)
    private Date createdAt;
    
    @ExcelIgnore
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updatedAt;
}
