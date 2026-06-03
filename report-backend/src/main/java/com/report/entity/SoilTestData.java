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
import java.math.BigDecimal;

@Data
@TableName("soil_test_data")
public class SoilTestData {
    
    @TableId(type = IdType.AUTO)
    @ExcelIgnore
    private Long id;

    @ExcelProperty(value = "农场编号", index = 0)
    private String farmCode;

    @ExcelProperty(value = "农场名称", index = 1)
    private String farmName;

    @ExcelProperty(value = "类型", index = 2)
    private String type;

    @ExcelProperty(value = "pH", index = 3)
    private BigDecimal ph;

    @ExcelProperty(value = "有机质", index = 4)
    private BigDecimal organicMatter;

    @ExcelProperty(value = "等级", index = 5)
    private String level;

    @ExcelProperty(value = "活性有机质", index = 6)
    private BigDecimal activeOrganicMatter;

    @ExcelProperty(value = "电导率", index = 7)
    private BigDecimal electroConductivity;

    @ExcelProperty(value = "水解氮", index = 8)
    private BigDecimal hydroNitrogen;

    @ExcelProperty(value = "有效磷", index = 9)
    private BigDecimal availPhosphorus;

    @ExcelProperty(value = "速效钾", index = 10)
    private BigDecimal availPotassium;

    @ExcelProperty(value = "有效钙", index = 11)
    private BigDecimal availCalcium;

    @ExcelProperty(value = "有效镁", index = 12)
    private BigDecimal availMagnesium;

    @ExcelProperty(value = "有效硫", index = 13)
    private BigDecimal availSulfur;

    @ExcelProperty(value = "有效硼", index = 14)
    private BigDecimal availBoron;

    @ExcelProperty(value = "有效铁", index = 15)
    private BigDecimal availIron;

    @ExcelProperty(value = "有效锰", index = 16)
    private BigDecimal availManganese;

    @ExcelProperty(value = "有效铜", index = 17)
    private BigDecimal availCopper;

    @ExcelProperty(value = "镉", index = 18)
    private BigDecimal cadmium;

    @ExcelProperty(value = "风险等级", index = 19)
    private String riskLevel;

    @ExcelProperty(value = "有效态镉", index = 20)
    private BigDecimal availCadmium;

    @ExcelProperty(value = "铬", index = 21)
    private BigDecimal chromium;

    @ExcelProperty(value = "汞", index = 22)
    private BigDecimal mercury;

    @ExcelProperty(value = "锌", index = 23)
    private BigDecimal zinc;

    @ExcelProperty(value = "砷", index = 24)
    private BigDecimal arsenic;

    @ExcelProperty(value = "铅", index = 25)
    private BigDecimal leadVal;

    @ExcelProperty(value = "铜", index = 26)
    private BigDecimal copper;

    @ExcelProperty(value = "镍", index = 27)
    private BigDecimal nickel;

    @ExcelProperty(value = "微生物碳", index = 28)
    private BigDecimal microbialCarbon;

    @ExcelProperty(value = "微生物氮", index = 29)
    private BigDecimal microbialNitrogen;

    @ExcelIgnore
    @TableField(fill = FieldFill.INSERT)
    private Date createdAt;
    
    @ExcelIgnore
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updatedAt;
}
