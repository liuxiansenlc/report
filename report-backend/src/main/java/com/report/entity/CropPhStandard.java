package com.report.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.alibaba.excel.annotation.ExcelIgnore;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("crop_ph_standard")
public class CropPhStandard {
    @TableId(type = IdType.AUTO)
    @ExcelIgnore
    private Long id;
    
    @ExcelProperty(value = "作物名称", index = 0)
    private String cropName;
    
    @ExcelProperty(value = "作物编号", index = 1)
    private String cropCode;
    
    @ExcelProperty(value = "PH区间最低", index = 2)
    private BigDecimal phMin;
    
    @ExcelProperty(value = "PH区间最高", index = 3)
    private BigDecimal phMax;
    
    @ExcelProperty(value = "土地利用类型", index = 4)
    private String landUseType;
    
    @ExcelIgnore
    @TableField(fill = FieldFill.INSERT)
    private Date createdAt;
    
    @ExcelIgnore
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updatedAt;
}
