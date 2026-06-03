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
@TableName("farm_info")
public class FarmInfo {
    @TableId(type = IdType.AUTO)
    @ExcelIgnore
    private Long id;
    
    @ExcelProperty("农场编号")
    private String farmCode;
    
    @ExcelProperty("农场名称")
    private String farmName;
    
    @ExcelProperty("农场地址")
    private String farmAddress;
    
    @ExcelProperty("品种")
    private String cropVariety;
    
    @ExcelProperty("农场面积（亩）")
    private BigDecimal farmArea;
    
    @ExcelProperty("农户名称")
    private String farmerName;
    
    @ExcelProperty("联系方式")
    private String contactInfo;
    
    @ExcelProperty("农场经度")
    private BigDecimal longitude;
    
    @ExcelProperty("农场纬度")
    private BigDecimal latitude;
    
    @ExcelIgnore
    private String imageUrl;
    
    @ExcelIgnore
    private Date createdAt;
    
    @ExcelIgnore
    private Date updatedAt;
}
