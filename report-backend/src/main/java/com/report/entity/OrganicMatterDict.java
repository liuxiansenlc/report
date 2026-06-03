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
@TableName("organic_matter_dict")
public class OrganicMatterDict {
    @TableId(type = IdType.AUTO)
    @ExcelIgnore
    private Long id;
    
    @ExcelProperty(value = "等级", index = 0)
    private String level;
    
    @ExcelProperty(value = "颜色", index = 1)
    private String color;
    
    @ExcelProperty(value = "描述", index = 2)
    private String description;
    
    @ExcelProperty(value = "数值", index = 3)
    private String valueRange;
    
    @ExcelIgnore
    @TableField(fill = FieldFill.INSERT)
    private Date createdAt;
    
    @ExcelIgnore
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updatedAt;
}
