package com.report.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.alibaba.excel.annotation.ExcelIgnore;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import java.util.Date;

@Data
@TableName("factory_info")
public class FactoryInfo {

    @TableId(type = IdType.AUTO)
    @ExcelIgnore
    private Long id;

    @ExcelProperty("序号")
    private String serialNumber;

    @ExcelProperty("工厂名称")
    private String name;

    @ExcelProperty("工厂地址")
    private String address;

    @ExcelProperty("经度")
    private String longitude;

    @ExcelProperty("纬度")
    private String latitude;

    @ExcelIgnore
    private Date createdAt;

    @ExcelIgnore
    private Date updatedAt;
}
