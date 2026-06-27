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

-- 初始模块菜单，固定主键以支持重复执行初始化脚本
INSERT IGNORE INTO `sys_category` (`id`, `name`, `path`, `sort_order`) VALUES
(1, '农村基础信息', '/report/farm-info', 1),
(2, '作物种植酸碱度最适区间', '/report/crop-ph-standard', 2),
(3, '重金属风险分级标准', '/report/soil-risk-standard', 3),
(4, '有机质级别字典', '/report/organic-matter-dict', 4),
(5, '基本指标', '/report/soil-test-data', 5),
(6, '检测报告', '/report/test-report', 6),
(7, '测试数据填报', '/report/test', 7),
(8, '财务数据填报', '/report/finance', 8),
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

-- Online production data snapshot exported on 2026-06-11.
-- REPLACE keeps this initialization script repeatable while preserving the exported primary keys.
SET NAMES utf8mb4;
START TRANSACTION;

REPLACE INTO `crop_ph_standard` VALUES (1,'番茄','1',5.20,6.50,'旱地',NULL,NULL),(2,'茄子','2',5.50,7.00,'旱地',NULL,NULL),(3,'羊肚菌','3',5.80,7.50,'旱地',NULL,NULL),(4,'白术','4',5.80,7.50,'旱地',NULL,NULL);

REPLACE INTO `economic_indicator` VALUES (1,'1','美民农业','改良前',0.0300,540.0000,5000.0000,270.0000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(2,'1','美民农业','改良后',0.0300,580.0000,5000.0000,290.0000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(3,'2','博商农业','改良前',0.0300,1044.0000,5000.0000,522.0000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(4,'2','博商农业','改良后',0.0300,1122.0000,5000.0000,561.0000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(5,'3','青农源','改良前',0.0300,161.4000,90000.0000,1452.6000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(6,'3','青农源','改良后',0.0200,164.5000,90000.0000,1480.5000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(7,'4','炊之园农业','改良前',0.0300,97.2000,90000.0000,874.8000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(8,'4','炊之园农业','改良后',0.0200,98.4000,90000.0000,885.6000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(9,'5','和信园林','改良前',0.0400,125.0000,1000.0000,12.5000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(10,'5','和信园林','改良后',0.0400,143.0000,1000.0000,14.3000,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(11,'6','信丰长达农业发展有限公司','改良前',0.0500,396.5000,1000.0000,39.6500,'2026-06-02 16:26:23','2026-06-02 16:26:23'),(12,'6','信丰长达农业发展有限公司','改良后',0.0400,400.8000,1000.0000,40.0800,'2026-06-02 16:26:23','2026-06-02 16:26:23');

REPLACE INTO `factory_info` VALUES (1,'1','至农科技发展（庆元）有限公司','浙江省丽水市庆元县黄田镇姚村村坳头殿1号','118.9333956','27.771694','2026-06-02 16:51:39','2026-06-02 16:51:39'),(2,'2','江西至农技术发展有限公司','江西省上饶市玉山县高新区西外环路以东区块','118.2245543','28.685867','2026-06-02 16:51:39','2026-06-02 16:51:39'),(3,'3','浙江省自然资源集团兰溪有机肥工厂','浙江省金华市兰溪市诸葛镇兰创鸿腾创业园A4栋','119.412727','29.225428','2026-06-02 16:51:39','2026-06-02 16:51:39'),(4,'4','常山农投集团有机肥工厂','浙江省衢州市常山县大桥头乡新村','118.6409','28.957937','2026-06-02 16:51:39','2026-06-02 16:51:39');

REPLACE INTO `farm_info` VALUES (1,'1','美民农业','必姆镇王宅水库管理局院内前房屋','番茄',90.00,'占丰慧','13319302385',118.1093574,28.6853453,NULL,'2026-06-02 16:54:10','2026-06-02 16:54:10'),(2,'2','博商农业','双明镇道堂村毛家28号','番茄',180.00,'陈杰','13755741100',118.3036917,28.8175389,NULL,'2026-06-02 16:54:10','2026-06-02 16:54:10'),(3,'3','青农源','仙岩镇黄茅坞村福建旦12号','羊肚菌',315.00,'朱东升','18651564872',118.3789945,28.5635482,NULL,'2026-06-02 16:54:10','2026-06-02 16:54:10'),(4,'4','炊之园农业','玉山县下镇镇黄坞','羊肚菌',190.00,'张晨','13758270623',118.4040785,28.6501099,NULL,'2026-06-02 16:54:10','2026-06-02 16:54:10'),(5,'5','和信园林','冰溪镇三清东路91号','茄子',50.00,'付宏高','18707035700',118.2752444,28.6868556,NULL,'2026-06-02 16:54:10','2026-06-02 16:54:10'),(6,'6','信丰长达农业发展有限公司','仙岩镇黄茅坞村蔬菜基地大棚办公室','茄子',150.00,'卢英刚','15172829849',118.3405843,28.5742040,NULL,'2026-06-02 16:54:10','2026-06-02 16:54:10'),(7,'7','长兴白术基地','长兴画溪街道横岗水库西500米','白术',36.00,'卓雅','13705825808',119.7620966,30.9864361,NULL,'2026-06-02 16:54:10','2026-06-02 16:54:10');

REPLACE INTO `organic_matter_dict` VALUES (1,'1级','橙色带黄','极缺乏','0-10',NULL,NULL),(2,'2级','黄色','缺乏','10-20',NULL,NULL),(3,'3级','黄色带绿','中等','20-30',NULL,NULL),(4,'4级','浅绿','较丰富','30-40',NULL,NULL),(5,'5级','深绿色','丰富','＞40',NULL,NULL);

REPLACE INTO `service_station` VALUES (1,'1','庆元服务点','庆元县姚村','118.898865','27.804916','2026-06-02 16:51:28','2026-06-02 16:51:28');

REPLACE INTO `soil_risk_standard` VALUES (1,'镉','严管控','≤5.5','≥1.5','旱地',NULL,NULL),(2,'镉','严管控','5.5＜pH≤6.5','≥2.0','旱地',NULL,NULL),(3,'镉','严管控','5.5＜pH≤7.5','≥3.0','旱地',NULL,NULL),(4,'镉','严管控','＞7.5','≥4.0','旱地',NULL,NULL),(5,'镉','高风险','≤5.5','0.3≤值＜1.5','旱地',NULL,NULL),(6,'镉','高风险','5.5＜pH≤6.5','0.3≤值＜2.0','旱地',NULL,NULL),(7,'镉','高风险','5.5＜pH≤7.5','0.3≤值＜3.0','旱地',NULL,NULL),(8,'镉','高风险','＞7.5','0.3≤值＜4.0','旱地',NULL,NULL),(9,'镉','低风险','≤5.5','＜0.3','旱地',NULL,NULL),(10,'镉','低风险','5.5＜pH≤6.5','＜0.3','旱地',NULL,NULL),(11,'镉','低风险','5.5＜pH≤7.5','＜0.3','旱地',NULL,NULL),(12,'镉','低风险','＞7.5','＜0.6','旱地',NULL,NULL),(13,'镉','严管控','≤5.5','≥1.5','水田',NULL,NULL),(14,'镉','严管控','5.5＜pH≤6.5','≥2.0','水田',NULL,NULL),(15,'镉','严管控','5.5＜pH≤7.5','≥3.0','水田',NULL,NULL),(16,'镉','严管控','＞7.5','≥4.0','水田',NULL,NULL),(17,'镉','高风险','≤5.5','0.3≤值＜1.5','水田',NULL,NULL),(18,'镉','高风险','5.5＜pH≤6.5','0.43≤值＜2.0','水田',NULL,NULL),(19,'镉','高风险','5.5＜pH≤7.5','0.6≤值＜3.0','水田',NULL,NULL),(20,'镉','高风险','＞7.5','0.8≤值＜4.0','水田',NULL,NULL),(21,'镉','低风险','≤5.5','＜0.3','水田',NULL,NULL),(22,'镉','低风险','5.5＜pH≤6.5','＜0.4','水田',NULL,NULL),(23,'镉','低风险','5.5＜pH≤7.5','＜0.6','水田',NULL,NULL),(24,'镉','低风险','＞7.5','＜0.8','水田',NULL,NULL);

REPLACE INTO `soil_test_data` VALUES (1,'1','美民农业','改良前',4.870,32.590,'四级',0.370,1085.100,67.200,16.600,254.400,563.000,165.000,98.000,0.780,2.600,12.600,0.250,1.5100,'高风险',0.1200,10.3000,0.0100,3.0900,3.4500,3.5000,11.6500,3.5100,84.3000,8.2500,NULL,NULL),(2,'1','美民农业','改良后',5.130,33.450,'四级',0.420,879.500,78.200,18.300,234.600,574.000,182.000,98.400,0.810,2.500,12.800,0.210,1.2300,'低风险',0.0900,9.4000,0.0100,3.2100,3.5200,3.6000,10.4900,3.9800,90.1000,8.8700,NULL,NULL),(3,'2','博商农业','改良前',5.120,29.370,'三级',0.280,937.100,54.300,17.800,266.500,669.000,134.000,78.000,0.690,2.500,10.300,0.220,0.3800,'中风险',0.0800,17.5000,0.0100,1.7900,2.8400,17.9000,36.7000,23.2000,78.5000,7.3900,NULL,NULL),(4,'2','博商农业','改良后',5.610,34.010,'四级',0.180,59.700,34.650,2.070,163.210,622.000,125.000,65.000,0.620,5.800,16.500,0.230,0.0400,'低风险',0.0200,21.5000,0.0200,4.2400,25.1400,45.5400,35.2000,7.2500,76.4000,8.5200,NULL,NULL),(5,'3','青农源','改良前',7.510,28.800,'三级',0.470,456.600,176.520,8.600,265.080,628.000,195.000,102.000,0.840,5.400,11.200,0.320,0.0800,'低风险',0.0000,21.2500,0.0100,5.1200,5.4700,21.5000,34.2800,5.5100,84.5000,10.3200,NULL,NULL),(6,'3','青农源','改良后',7.120,27.600,'三级',0.370,638.300,178.300,10.400,263.400,680.000,176.000,89.000,0.560,6.900,14.300,0.290,0.1700,'低风险',0.0000,36.1500,0.0100,4.9700,19.2400,37.4000,42.8600,7.2900,82.3000,9.3500,NULL,NULL),(7,'4','炊之园农业','改良前',5.870,29.400,'三级',0.150,827.400,52.700,14.670,263.630,543.000,145.000,73.000,0.780,3.200,14.300,0.290,0.0900,'低风险',0.0000,38.2000,0.0100,1.9300,27.3200,46.2900,48.9000,7.9100,74.2000,8.0100,NULL,NULL),(8,'4','炊之园农业','改良后',6.670,42.490,'五级',0.350,962.600,53.900,12.870,260.100,515.000,125.000,84.000,0.840,2.800,12.400,0.310,0.0300,'低风险',0.0000,45.2000,0.0100,2.8400,24.2500,42.1400,21.3200,5.2100,56.1000,7.8400,NULL,NULL),(9,'5','和信园林','改良前',6.940,31.130,'四级',0.130,205.300,79.330,5.000,233.010,622.000,120.000,85.000,0.480,5.600,16.500,0.130,0.0100,'低风险',0.0000,35.3000,0.0100,4.5200,24.3200,42.1200,56.6500,11.2300,59.8000,7.0500,NULL,NULL),(10,'5','和信园林','改良后',6.180,33.240,'四级',0.170,389.300,76.470,7.200,238.200,599.000,145.000,69.000,0.520,7.400,13.800,0.180,0.0800,'低风险',0.0000,39.2000,0.0100,5.3400,32.7600,49.1200,62.1000,15.7800,65.3000,7.1200,NULL,NULL),(11,'6','信丰长达农业发展有限公司','改良前',6.810,49.710,'五级',0.190,761.500,81.550,8.430,228.870,425.000,178.000,96.000,0.740,3.100,10.200,0.200,0.0400,'低风险',0.0000,28.4500,0.0100,2.2500,10.2500,35.2100,31.2500,9.3700,104.2000,8.9300,NULL,NULL),(12,'6','信丰长达农业发展有限公司','改良后',6.120,32.140,'四级',0.190,398.100,79.320,5.380,219.240,419.000,128.000,74.000,0.690,5.800,12.400,0.320,0.1700,'低风险',0.0000,42.3400,0.0100,3.2900,37.2500,29.3400,58.3900,12.1700,92.3000,9.1700,NULL,NULL),(13,'7','长兴白术基地','改良前',4.690,6.420,'一级',0.120,120.000,108.000,0.400,51.500,2.000,1.300,194.300,0.320,11.600,35.700,0.014,0.0560,'低风险',0.0000,74.6000,0.0365,12.6000,33.5000,63.2000,30.2000,4.3200,51.2000,5.5800,NULL,NULL);

REPLACE INTO `sys_category` VALUES (1,'农村基础信息','/report/farm-info',1,'2026-06-02 16:23:46'),(2,'作物种植酸碱度最适区间','/report/crop-ph-standard',2,'2026-06-02 16:23:46'),(3,'重金属风险分级标准','/report/soil-risk-standard',3,'2026-06-02 16:23:46'),(4,'有机质级别字典','/report/organic-matter-dict',4,'2026-06-02 16:23:46'),(5,'基本指标','/report/soil-test-data',5,'2026-06-02 16:23:46'),(6,'检测报告','/report/test-report',6,'2026-06-02 16:23:46'),(7,'测试数据填报','/report/test',7,'2026-06-02 16:23:46'),(8,'财务数据填报','/report/finance',8,'2026-06-02 16:23:46'),(9,'经济指标','/report/economic-indicator',7,'2026-06-02 16:23:46'),(10,'服务站基础信息','/report/service-station',8,'2026-06-02 16:23:46'),(11,'工厂基础信息','/report/factory-info',9,'2026-06-02 16:23:46');

REPLACE INTO `sys_user` VALUES (1,'admin','123456','2026-06-02 16:23:46','2026-06-02 16:23:46');

REPLACE INTO `test_report` VALUES (1,'1','美民农业','改良前检测报告','2025-02-28','/api/uploads/26d313c9f2d44c04b88e2fa6ff39d883.pdf','美民农业土壤检测报告-1.pdf',NULL,NULL),(2,'1','美民农业','改良方案','2025-03-19','/api/uploads/31948a8dfa694eae905ca11c43935d32.pdf','玉山县美民土壤改良报告.pdf',NULL,NULL),(3,'1','美民农业','改良后检测报告','2025-06-30','/api/uploads/34bd144583094c5e8409e64e77b46787.pdf','玉山县美民农业土壤检测报告-2.pdf',NULL,NULL),(4,'2','博商农业','改良前检测报告','2025-02-28','/api/uploads/e53b85cb943f4a0996c37e4842272fbb.pdf','博商农业土壤检测报告-1.pdf',NULL,NULL),(5,'2','博商农业','改良方案','2025-03-19','/api/uploads/19d2aba0ae174d6081ffd4ddd99d99f3.pdf','玉山县博商农业土壤改良报告.pdf',NULL,NULL),(6,'2','博商农业','改良后检测报告','2025-06-30','/api/uploads/fdefd992e9324d958efc8eb349ec4d29.pdf','玉山县博商农业土壤检测报告-2.pdf',NULL,NULL),(7,'3','青农源','改良前检测报告','2025-02-28','/api/uploads/95463bd034a34625b6966d3de3c01890.pdf','青农源土壤检测报告-1.pdf',NULL,NULL),(8,'3','青农源','改良方案','2025-03-19','/api/uploads/bd0cdfec896149f690d3a93535bd1a5d.pdf','玉山县青农源土壤改良报告.pdf',NULL,NULL),(9,'3','青农源','改良后检测报告','2025-06-30','/api/uploads/8a46bfbb9fd849adbb2ce91e17e06fe3.pdf','玉山县青农源土壤检测报告-2.pdf',NULL,NULL),(10,'4','炊之园农业','改良前检测报告','2025-02-28','/api/uploads/a8c934b3117a44b99e2cf4853fee58b2.pdf','炊之园土壤检测报告-1.pdf',NULL,NULL),(11,'4','炊之园农业','改良方案','2025-03-19','/api/uploads/c8dbe88c1d264d4eb09b34249f1742b8.pdf','玉山县炊之园土壤改良报告 .pdf',NULL,NULL),(12,'4','炊之园农业','改良后检测报告','2025-06-30','/api/uploads/0452cab531cd43ea84cfeb22972fd24c.pdf','玉山县炊之园农业土壤检测报告-2.pdf',NULL,NULL),(13,'5','和信园林','改良前检测报告','2025-02-28','/api/uploads/228b66474c1b4df7abe0ab2b14ee0287.pdf','和信园林土壤检测报告-1.pdf',NULL,NULL),(14,'5','和信园林','改良方案','2025-03-19','/api/uploads/14e97a4971d64056b19ecc4494451df2.pdf','玉山县和信园林土壤改良报告.pdf',NULL,NULL),(15,'5','和信园林','改良后检测报告','2025-06-30','/api/uploads/90ef429826bb488595953e93801108a9.pdf','玉山县和信园林土壤检测报告-2.pdf',NULL,NULL),(16,'6','信丰长达农业发展有限公司','改良前检测报告','2025-02-28','/api/uploads/74cd01b0adec4966a538b86be509dbd2.pdf','赵氏种植专业合作社土壤检测报告.pdf',NULL,NULL),(17,'6','信丰长达农业发展有限公司','改良方案','2025-06-02','/api/uploads/d39ce33d648c4e42b9ae0cabe535f439.pdf','赵氏种植专业合作社土壤检测报告.pdf',NULL,NULL),(18,'6','信丰长达农业发展有限公司','改良后检测报告','2025-06-30','/api/uploads/cdfb41e6521c45ae907fe1d02ad86252.pdf','玉山县信丰土壤检测报告.pdf',NULL,NULL),(19,'7','长兴白术基地','改良前检测报告','2026-01-31','/api/uploads/042c10eff1de4992b47b91d6c845eef5.pdf','浙江长兴白术基地土壤检测报告.pdf',NULL,NULL);

COMMIT;
