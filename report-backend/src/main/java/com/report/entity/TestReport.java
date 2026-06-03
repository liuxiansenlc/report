package com.report.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.FieldFill;
import lombok.Data;
import java.util.Date;

@Data
@TableName("test_report")
public class TestReport {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String farmCode;

    private String farmName;

    private String reportType;

    private Date reportDate;

    private String fileUrl;

    private String fileName;

    @TableField(fill = FieldFill.INSERT)
    private Date createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updatedAt;
}
