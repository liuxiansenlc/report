CREATE DATABASE IF NOT EXISTS `report` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `report`;

CREATE TABLE IF NOT EXISTS `sys_user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 初始管理员账号密码: admin / 123456
INSERT IGNORE INTO `sys_user` (`username`, `password`) VALUES ('admin', '123456');

CREATE TABLE IF NOT EXISTS `sys_category` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '模块名称',
  `path` VARCHAR(255) COMMENT '前端路由路径',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务模块表';

-- 初始模块菜单
INSERT IGNORE INTO `sys_category` (`name`, `path`, `sort_order`) VALUES 
('农村基础信息', '/report/farm-info', 1),
('作物种植酸碱度最适区间', '/report/crop-ph-standard', 2),
('重金属风险分级标准', '/report/soil-risk-standard', 3),
('有机质级别字典', '/report/organic-matter-dict', 4),
('基本指标', '/report/soil-test-data', 5),
('检测报告', '/report/test-report', 6),
('测试数据填报', '/report/test', 7),
('财务数据填报', '/report/finance', 8);

-- Additional report modules required by admin routes
INSERT IGNORE INTO `sys_category` (`id`, `name`, `path`, `sort_order`) VALUES
(9, '经济指标', '/report/economic-indicator', 7),
(10, '服务站基础信息', '/report/service-station', 8),
(11, '工厂基础信息', '/report/factory-info', 9);

CREATE TABLE IF NOT EXISTS `farm_info` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `farm_code` VARCHAR(50) NOT NULL COMMENT '农场编号',
  `farm_name` VARCHAR(100) NOT NULL COMMENT '农场名称',
  `farm_address` VARCHAR(255) COMMENT '农场地址',
  `crop_variety` VARCHAR(100) COMMENT '品种',
  `farm_area` DECIMAL(10,2) COMMENT '农场面积（亩）',
  `farmer_name` VARCHAR(50) COMMENT '农户名称',
  `contact_info` VARCHAR(50) COMMENT '联系方式',
  `longitude` DECIMAL(10,7) COMMENT '农场经度',
  `latitude` DECIMAL(10,7) COMMENT '农场纬度',
  `image_url` VARCHAR(255) COMMENT '农场图片路线',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农村基础信息表';

CREATE TABLE IF NOT EXISTS `crop_ph_standard` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `crop_name` VARCHAR(100) NOT NULL COMMENT '作物名称',
  `crop_code` VARCHAR(50) COMMENT '作物编号',
  `ph_min` DECIMAL(4,2) COMMENT 'PH区间最低',
  `ph_max` DECIMAL(4,2) COMMENT 'PH区间最高',
  `land_use_type` VARCHAR(100) COMMENT '土地利用类型',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作物种植酸碱度最适区间表';

CREATE TABLE IF NOT EXISTS `soil_risk_standard` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `indicator` VARCHAR(50) NOT NULL COMMENT '指标',
  `risk_level` VARCHAR(50) COMMENT '风险等级',
  `ph_range_expr` VARCHAR(100) COMMENT 'pH数值',
  `value_range_expr` VARCHAR(100) COMMENT '数值',
  `land_use_type` VARCHAR(100) COMMENT '土地利用类型',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='重金属风险分级标准表';

CREATE TABLE IF NOT EXISTS `organic_matter_dict` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `level` VARCHAR(50) NOT NULL COMMENT '等级',
  `color` VARCHAR(50) COMMENT '颜色',
  `description` VARCHAR(200) COMMENT '描述',
  `value_range` VARCHAR(100) COMMENT '数值',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='有机质字典表';

CREATE TABLE IF NOT EXISTS `soil_test_data` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `farm_code` VARCHAR(50) NOT NULL COMMENT '农场编号',
  `farm_name` VARCHAR(100) NOT NULL COMMENT '农场名称',
  `type` VARCHAR(50) DEFAULT NULL COMMENT '类型',
  `ph` DECIMAL(10,3) DEFAULT NULL COMMENT 'pH',
  `organic_matter` DECIMAL(10,3) DEFAULT NULL COMMENT '有机质',
  `level` VARCHAR(20) DEFAULT NULL COMMENT '等级',
  `active_organic_matter` DECIMAL(10,3) DEFAULT NULL COMMENT '活性有机质',
  `electro_conductivity` DECIMAL(10,3) DEFAULT NULL COMMENT '电导率',
  `hydro_nitrogen` DECIMAL(10,3) DEFAULT NULL COMMENT '水解氮',
  `avail_phosphorus` DECIMAL(10,3) DEFAULT NULL COMMENT '有效磷',
  `avail_potassium` DECIMAL(10,3) DEFAULT NULL COMMENT '速效钾',
  `avail_calcium` DECIMAL(10,3) DEFAULT NULL COMMENT '有效钙',
  `avail_magnesium` DECIMAL(10,3) DEFAULT NULL COMMENT '有效镁',
  `avail_sulfur` DECIMAL(10,3) DEFAULT NULL COMMENT '有效硫',
  `avail_boron` DECIMAL(10,3) DEFAULT NULL COMMENT '有效硼',
  `avail_iron` DECIMAL(10,3) DEFAULT NULL COMMENT '有效铁',
  `avail_manganese` DECIMAL(10,3) DEFAULT NULL COMMENT '有效锰',
  `avail_copper` DECIMAL(10,3) DEFAULT NULL COMMENT '有效铜',
  `cadmium` DECIMAL(10,4) DEFAULT NULL COMMENT '镉',
  `risk_level` VARCHAR(50) DEFAULT NULL COMMENT '风险等级',
  `avail_cadmium` DECIMAL(10,4) DEFAULT NULL COMMENT '有效态镉',
  `chromium` DECIMAL(10,4) DEFAULT NULL COMMENT '铬',
  `mercury` DECIMAL(10,4) DEFAULT NULL COMMENT '汞',
  `arsenic` DECIMAL(10,4) DEFAULT NULL COMMENT '砷',
  `lead_val` DECIMAL(10,4) DEFAULT NULL COMMENT '铅',
  `copper` DECIMAL(10,4) DEFAULT NULL COMMENT '铜',
  `zinc` DECIMAL(10,4) DEFAULT NULL COMMENT '锌',
  `nickel` DECIMAL(10,4) DEFAULT NULL COMMENT '镍',
  `microbial_carbon` DECIMAL(10,4) DEFAULT NULL COMMENT '微生物碳',
  `microbial_nitrogen` DECIMAL(10,4) DEFAULT NULL COMMENT '微生物氮',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='土壤基本指标数据表';

CREATE TABLE IF NOT EXISTS `economic_indicator` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `farm_code` VARCHAR(50) NOT NULL COMMENT '农场编号',
  `farm_name` VARCHAR(100) NOT NULL COMMENT '农场名称',
  `type` VARCHAR(50) DEFAULT NULL COMMENT '类型',
  `fertilizer_amount` DECIMAL(10,4) DEFAULT NULL COMMENT '化肥用量（吨/亩）',
  `crop_yield` DECIMAL(10,4) DEFAULT NULL COMMENT '农作产量（吨/亩）',
  `unit_price` DECIMAL(10,4) DEFAULT NULL COMMENT '单价（元/吨）',
  `revenue` DECIMAL(10,4) DEFAULT NULL COMMENT '收益（万元）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经济指标表';

CREATE TABLE IF NOT EXISTS `service_station` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `serial_number` VARCHAR(50) DEFAULT NULL COMMENT '序号',
  `name` VARCHAR(255) DEFAULT NULL COMMENT '服务点名称',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '服务点地址',
  `longitude` VARCHAR(50) DEFAULT NULL COMMENT '经度',
  `latitude` VARCHAR(50) DEFAULT NULL COMMENT '纬度',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务站基础信息表';

CREATE TABLE IF NOT EXISTS `factory_info` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `serial_number` VARCHAR(50) DEFAULT NULL COMMENT '序号',
  `name` VARCHAR(255) DEFAULT NULL COMMENT '工厂名称',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '工厂地址',
  `longitude` VARCHAR(50) DEFAULT NULL COMMENT '经度',
  `latitude` VARCHAR(50) DEFAULT NULL COMMENT '纬度',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工厂基础信息表';

CREATE TABLE IF NOT EXISTS `test_report` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `farm_code` VARCHAR(50) NOT NULL COMMENT '农场编号',
  `farm_name` VARCHAR(100) NOT NULL COMMENT '农场名称',
  `report_type` VARCHAR(50) NOT NULL COMMENT '报告类型',
  `report_date` DATE DEFAULT NULL COMMENT '检测日期',
  `file_url` VARCHAR(255) DEFAULT NULL COMMENT 'PDF附件链接',
  `file_name` VARCHAR(255) DEFAULT NULL COMMENT '上传原始文件名',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检测报告库';
