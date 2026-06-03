package com.report.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.alibaba.excel.annotation.ExcelIgnore;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import java.util.Date;

@Data
@TableName("service_station")
public class ServiceStation {

    @TableId(type = IdType.AUTO)
    @ExcelIgnore
    private Long id;

    @ExcelProperty("序号")
    private String serialNumber;

    @ExcelProperty("服务点名称")
    private String name;

    @ExcelProperty("服务点地址")
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
