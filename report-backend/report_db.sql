/*
 Navicat Premium Data Transfer

 Source Server         : 192.168.31.142_53307
 Source Server Type    : MySQL
 Source Server Version : 80036 (8.0.36)
 Source Host           : 192.168.31.142:53307
 Source Schema         : report_db

 Target Server Type    : MySQL
 Target Server Version : 80036 (8.0.36)
 File Encoding         : 65001

 Date: 02/06/2026 15:37:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for crop_ph_standard
-- ----------------------------
DROP TABLE IF EXISTS `crop_ph_standard`;
CREATE TABLE `crop_ph_standard`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `crop_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '作物名称',
  `crop_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '作物编号',
  `ph_min` decimal(4, 2) NULL DEFAULT NULL COMMENT 'PH区间最低',
  `ph_max` decimal(4, 2) NULL DEFAULT NULL COMMENT 'PH区间最高',
  `land_use_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '土地利用类型',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '作物种植酸碱度最适区间表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of crop_ph_standard
-- ----------------------------
INSERT INTO `crop_ph_standard` VALUES (1, '番茄', '1', 5.20, 6.50, '旱地', NULL, NULL);
INSERT INTO `crop_ph_standard` VALUES (2, '茄子', '2', 5.50, 7.00, '旱地', NULL, NULL);
INSERT INTO `crop_ph_standard` VALUES (3, '羊肚菌', '3', 5.80, 7.50, '旱地', NULL, NULL);
INSERT INTO `crop_ph_standard` VALUES (4, '白术', '4', 5.80, 7.50, '旱地', NULL, NULL);

-- ----------------------------
-- Table structure for economic_indicator
-- ----------------------------
DROP TABLE IF EXISTS `economic_indicator`;
CREATE TABLE `economic_indicator`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `farm_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场编号',
  `farm_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场名称',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '类型(改良前/改良后)',
  `fertilizer_amount` decimal(10, 4) NULL DEFAULT NULL COMMENT '化肥用量（吨）',
  `crop_yield` decimal(10, 4) NULL DEFAULT NULL COMMENT '农作产量（吨）',
  `unit_price` decimal(10, 4) NULL DEFAULT NULL COMMENT '单价（元/吨）',
  `revenue` decimal(10, 4) NULL DEFAULT NULL COMMENT '收益（万元）',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '经济指标表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of economic_indicator
-- ----------------------------
INSERT INTO `economic_indicator` VALUES (1, '1', '美民农业', '改良前', 8.7000, 540.0000, 5000.0000, 270.0000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (2, '1', '美民农业', '改良后', 7.2000, 580.0000, 5000.0000, 290.0000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (3, '2', '博商农业', '改良前', 15.3000, 1044.0000, 5000.0000, 522.0000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (4, '2', '博商农业', '改良后', 12.0000, 1122.0000, 5000.0000, 561.0000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (5, '3', '青农源', '改良前', 29.3000, 161.4000, 90000.0000, 1452.6000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (6, '3', '青农源', '改良后', 28.4000, 164.5000, 90000.0000, 1480.5000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (7, '4', '炊之园农业', '改良前', 18.2000, 97.2000, 90000.0000, 874.8000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (8, '4', '炊之园农业', '改良后', 18.6000, 98.4000, 90000.0000, 885.6000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (9, '5', '和信园林', '改良前', 4.5000, 125.0000, 1000.0000, 12.5000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (10, '5', '和信园林', '改良后', 3.8000, 143.0000, 1000.0000, 14.3000, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (11, '6', '信丰长达农业发展有限公司', '改良前', 14.2000, 396.5000, 1000.0000, 39.6500, '2026-04-20 06:09:23', '2026-04-20 06:09:23');
INSERT INTO `economic_indicator` VALUES (12, '6', '信丰长达农业发展有限公司', '改良后', 13.2000, 400.8000, 1000.0000, 40.0800, '2026-04-20 06:09:23', '2026-04-20 06:09:23');

-- ----------------------------
-- Table structure for factory_info
-- ----------------------------
DROP TABLE IF EXISTS `factory_info`;
CREATE TABLE `factory_info`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `serial_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '序号',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '工厂名称',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '工厂地址',
  `longitude` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '经度',
  `latitude` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '纬度',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '工厂基础信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of factory_info
-- ----------------------------

-- ----------------------------
-- Table structure for farm_info
-- ----------------------------
DROP TABLE IF EXISTS `farm_info`;
CREATE TABLE `farm_info`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `farm_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场编号',
  `farm_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场名称',
  `farm_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '农场地址',
  `crop_variety` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '品种',
  `farm_area` decimal(10, 2) NULL DEFAULT NULL COMMENT '农场面积（亩）',
  `farmer_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '农户名称',
  `contact_info` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '联系方式',
  `longitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '农场经度',
  `latitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '农场纬度',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '农场图片',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '农村基础信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of farm_info
-- ----------------------------
INSERT INTO `farm_info` VALUES (15, '1', '美民农业', '必姆镇王宅水库管理局院内前房屋', '番茄', 90.00, '占丰慧', '13319302385', 118.1093574, 28.6853453, '2026-04-19 02:18:45', '2026-04-19 02:18:45', '/api/uploads/58ce41e90b9548bc9867f176a01462bf.png');
INSERT INTO `farm_info` VALUES (16, '2', '博商农业', '双明镇道堂村毛家28号', '番茄', 180.00, '陈杰', '13755741100', 118.3036917, 28.8175389, '2026-04-19 02:18:45', '2026-04-19 02:18:45', NULL);
INSERT INTO `farm_info` VALUES (17, '3', '青农源', '仙岩镇黄茅坞村福建旦12号', '羊肚菌', 315.00, '朱东升', '18651564872', 118.3789945, 28.5635482, '2026-04-19 02:18:45', '2026-04-19 02:18:45', NULL);
INSERT INTO `farm_info` VALUES (18, '4', '炊之园农业', '玉山县下镇镇黄坞', '羊肚菌', 190.00, '张晨', '13758270623', 118.4040785, 28.6501099, '2026-04-19 02:18:45', '2026-04-19 02:18:45', NULL);
INSERT INTO `farm_info` VALUES (19, '5', '和信园林', '冰溪镇三清东路91号', '茄子', 50.00, '付宏高', '18707035700', 118.2752444, 28.6868556, '2026-04-19 02:18:45', '2026-04-19 02:18:45', NULL);
INSERT INTO `farm_info` VALUES (20, '6', '信丰长达农业发展有限公司', '仙岩镇黄茅坞村蔬菜基地大棚办公室', '茄子', 150.00, '卢英刚', '15172829849', 118.3405843, 28.5742040, '2026-04-19 02:18:45', '2026-04-19 02:18:45', NULL);
INSERT INTO `farm_info` VALUES (21, '7', '长兴白术基地', '长兴画溪街道横岗水库西500米', '白术', 36.00, '卓雅', '13705825808', 119.7620966, 30.9864361, '2026-04-19 02:18:45', '2026-04-19 02:18:45', NULL);

-- ----------------------------
-- Table structure for organic_matter_dict
-- ----------------------------
DROP TABLE IF EXISTS `organic_matter_dict`;
CREATE TABLE `organic_matter_dict`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '等级',
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '颜色',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '描述',
  `value_range` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '数值',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '有机质字典表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of organic_matter_dict
-- ----------------------------
INSERT INTO `organic_matter_dict` VALUES (1, '1级', '橙色带黄', '极缺乏', '0-10', NULL, NULL);
INSERT INTO `organic_matter_dict` VALUES (2, '2级', '黄色', '缺乏', '10-20', NULL, NULL);
INSERT INTO `organic_matter_dict` VALUES (3, '3级', '黄色带绿', '中等', '20-30', NULL, NULL);
INSERT INTO `organic_matter_dict` VALUES (4, '4级', '浅绿', '较丰富', '30-40', NULL, NULL);
INSERT INTO `organic_matter_dict` VALUES (5, '5级', '深绿色', '丰富', '＞40', NULL, NULL);

-- ----------------------------
-- Table structure for service_station
-- ----------------------------
DROP TABLE IF EXISTS `service_station`;
CREATE TABLE `service_station`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `serial_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '序号',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '服务点名称',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '服务点地址',
  `longitude` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '经度',
  `latitude` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '纬度',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '服务站基础信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of service_station
-- ----------------------------

-- ----------------------------
-- Table structure for soil_risk_standard
-- ----------------------------
DROP TABLE IF EXISTS `soil_risk_standard`;
CREATE TABLE `soil_risk_standard`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `indicator` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '指标',
  `risk_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '风险等级',
  `ph_range_expr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'pH数值',
  `value_range_expr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '数值',
  `land_use_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '土地利用类型',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 49 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '重金属风险分级标准表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soil_risk_standard
-- ----------------------------
INSERT INTO `soil_risk_standard` VALUES (25, '镉', '高', '≤5.5', '≥1.5', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (26, '镉', '高', '5.5＜pH≤6.5', '≥2.0', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (27, '镉', '高', '5.5＜pH≤7.5', '≥3.0', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (28, '镉', '高', '＞7.5', '≥4.0', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (29, '镉', '中', '≤5.5', '0.3≤值＜1.5', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (30, '镉', '中', '5.5＜pH≤6.5', '0.3≤值＜2.0', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (31, '镉', '中', '5.5＜pH≤7.5', '0.3≤值＜3.0', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (32, '镉', '中', '＞7.5', '0.3≤值＜4.0', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (33, '镉', '低', '≤5.5', '＜0.3', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (34, '镉', '低', '5.5＜pH≤6.5', '＜0.3', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (35, '镉', '低', '5.5＜pH≤7.5', '＜0.3', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (36, '镉', '低', '＞7.5', '＜0.6', '旱地', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (37, '镉', '高', '≤5.5', '≥1.5', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (38, '镉', '高', '5.5＜pH≤6.5', '≥2.0', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (39, '镉', '高', '5.5＜pH≤7.5', '≥3.0', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (40, '镉', '高', '＞7.5', '≥4.0', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (41, '镉', '中', '≤5.5', '0.3≤值＜1.5', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (42, '镉', '中', '5.5＜pH≤6.5', '0.43≤值＜2.0', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (43, '镉', '中', '5.5＜pH≤7.5', '0.6≤值＜3.0', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (44, '镉', '中', '＞7.5', '0.8≤值＜4.0', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (45, '镉', '低', '≤5.5', '＜0.3', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (46, '镉', '低', '5.5＜pH≤6.5', '＜0.4', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (47, '镉', '低', '5.5＜pH≤7.5', '＜0.6', '水田', NULL, NULL);
INSERT INTO `soil_risk_standard` VALUES (48, '镉', '低', '＞7.5', '＜0.8', '水田', NULL, NULL);

-- ----------------------------
-- Table structure for soil_test_data
-- ----------------------------
DROP TABLE IF EXISTS `soil_test_data`;
CREATE TABLE `soil_test_data`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `farm_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场编号',
  `farm_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场名称',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '类型',
  `ph` decimal(10, 3) NULL DEFAULT NULL COMMENT 'pH',
  `organic_matter` decimal(10, 3) NULL DEFAULT NULL COMMENT '有机质',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '等级',
  `active_organic_matter` decimal(10, 3) NULL DEFAULT NULL COMMENT '活性有机质',
  `electro_conductivity` decimal(10, 3) NULL DEFAULT NULL COMMENT '电导率',
  `hydro_nitrogen` decimal(10, 3) NULL DEFAULT NULL COMMENT '水解氮',
  `avail_phosphorus` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效磷',
  `avail_potassium` decimal(10, 3) NULL DEFAULT NULL COMMENT '速效钾',
  `avail_calcium` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效钙',
  `avail_magnesium` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效镁',
  `avail_sulfur` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效硫',
  `avail_boron` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效硼',
  `avail_iron` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效铁',
  `avail_manganese` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效锰',
  `avail_copper` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效铜',
  `cadmium` decimal(10, 4) NULL DEFAULT NULL COMMENT '镉',
  `risk_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '风险等级',
  `avail_cadmium` decimal(10, 4) NULL DEFAULT NULL COMMENT '有效态镉',
  `chromium` decimal(10, 4) NULL DEFAULT NULL COMMENT '铬',
  `mercury` decimal(10, 4) NULL DEFAULT NULL COMMENT '汞',
  `arsenic` decimal(10, 4) NULL DEFAULT NULL COMMENT '砷',
  `lead_val` decimal(10, 4) NULL DEFAULT NULL COMMENT '铅',
  `copper` decimal(10, 4) NULL DEFAULT NULL COMMENT '铜',
  `zinc` decimal(10, 4) NULL DEFAULT NULL COMMENT '锌',
  `nickel` decimal(10, 4) NULL DEFAULT NULL COMMENT '镍',
  `microbial_carbon` decimal(10, 4) NULL DEFAULT NULL COMMENT '微生物碳',
  `microbial_nitrogen` decimal(10, 4) NULL DEFAULT NULL COMMENT '微生物氮',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '土壤基本指标数据表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soil_test_data
-- ----------------------------
INSERT INTO `soil_test_data` VALUES (4, '1', '美民农业', '改良前', 4.870, 32.590, '四级', 0.370, 1085.100, 67.200, 16.600, 254.400, 563.000, 165.000, 98.000, 0.780, 2.600, 12.600, 0.250, 0.0200, '低风险', 0.0000, 10.3000, 0.0100, 11.6500, 3.0900, 3.4500, 3.5000, 3.5100, 84.3000, 4.2500, NULL, '2026-04-19 04:32:55');
INSERT INTO `soil_test_data` VALUES (5, '1', '美民农业', '改良后', 5.130, 33.450, '四级', 0.420, 879.500, 78.200, 18.300, 234.600, 574.000, 182.000, 98.400, 0.810, 2.500, 12.800, 0.210, 0.0200, '低风险', 0.0000, 9.4000, 0.0100, 10.4900, 3.2100, 3.5200, 3.6000, 3.9800, 90.1000, 4.8700, NULL, '2026-04-19 04:32:55');

-- ----------------------------
-- Table structure for soil_test_data_copy1
-- ----------------------------
DROP TABLE IF EXISTS `soil_test_data_copy1`;
CREATE TABLE `soil_test_data_copy1`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `farm_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场编号',
  `farm_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场名称',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '类型',
  `ph` decimal(10, 3) NULL DEFAULT NULL COMMENT 'pH',
  `organic_matter` decimal(10, 3) NULL DEFAULT NULL COMMENT '有机质',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '等级',
  `active_organic_matter` decimal(10, 3) NULL DEFAULT NULL COMMENT '活性有机质',
  `electro_conductivity` decimal(10, 3) NULL DEFAULT NULL COMMENT '电导率',
  `hydro_nitrogen` decimal(10, 3) NULL DEFAULT NULL COMMENT '水解氮',
  `avail_phosphorus` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效磷',
  `avail_potassium` decimal(10, 3) NULL DEFAULT NULL COMMENT '速效钾',
  `avail_calcium` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效钙',
  `avail_magnesium` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效镁',
  `avail_sulfur` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效硫',
  `avail_boron` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效硼',
  `avail_iron` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效铁',
  `avail_manganese` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效锰',
  `avail_copper` decimal(10, 3) NULL DEFAULT NULL COMMENT '有效铜',
  `cadmium` decimal(10, 4) NULL DEFAULT NULL COMMENT '镉',
  `risk_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '风险等级',
  `avail_cadmium` decimal(10, 4) NULL DEFAULT NULL COMMENT '有效态镉',
  `chromium` decimal(10, 4) NULL DEFAULT NULL COMMENT '铬',
  `mercury` decimal(10, 4) NULL DEFAULT NULL COMMENT '汞',
  `arsenic` decimal(10, 4) NULL DEFAULT NULL COMMENT '砷',
  `lead_val` decimal(10, 4) NULL DEFAULT NULL COMMENT '铅',
  `copper` decimal(10, 4) NULL DEFAULT NULL COMMENT '铜',
  `zinc` decimal(10, 4) NULL DEFAULT NULL COMMENT '锌',
  `nickel` decimal(10, 4) NULL DEFAULT NULL COMMENT '镍',
  `microbial_carbon` decimal(10, 4) NULL DEFAULT NULL COMMENT '微生物碳',
  `microbial_nitrogen` decimal(10, 4) NULL DEFAULT NULL COMMENT '微生物氮',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '土壤基本指标数据表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soil_test_data_copy1
-- ----------------------------
INSERT INTO `soil_test_data_copy1` VALUES (4, '1', '美民农业', '改良前', 4.870, 32.590, '2级', 0.370, 1085.100, 67.200, 16.600, 254.400, 563.000, 165.000, 98.000, 0.780, 2.600, 12.600, 0.250, 0.0200, '低风险', 0.0000, 10.3000, 0.0100, 3.0900, 3.4500, 3.5000, 11.6500, 3.5100, 84.3000, 4.2500, NULL, NULL);

-- ----------------------------
-- Table structure for sys_category
-- ----------------------------
DROP TABLE IF EXISTS `sys_category`;
CREATE TABLE `sys_category`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '模块名称',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '前端路由路径',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '业务模块表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_category
-- ----------------------------
INSERT INTO `sys_category` VALUES (1, '农场基础信息', '/report/farm-info', 1, '2026-04-19 01:34:13');
INSERT INTO `sys_category` VALUES (4, '作物种植酸碱度最适区间', '/report/crop-ph-standard', 2, '2026-04-19 02:23:02');
INSERT INTO `sys_category` VALUES (5, '重金属风险分级标准', '/report/soil-risk-standard', 3, '2026-04-19 02:34:28');
INSERT INTO `sys_category` VALUES (6, '有机质级别字典', '/report/organic-matter-dict', 4, '2026-04-19 02:39:27');
INSERT INTO `sys_category` VALUES (7, '基本指标', '/report/soil-test-data', 5, '2026-04-19 02:44:28');
INSERT INTO `sys_category` VALUES (8, '检测报告', '/report/test-report', 6, '2026-04-19 03:06:25');
INSERT INTO `sys_category` VALUES (9, '经济指标', '/report/economic-indicator', 7, '2026-04-20 06:01:46');
INSERT INTO `sys_category` VALUES (10, '服务站基础信息', '/report/service-station', 8, '2026-04-28 06:55:36');
INSERT INTO `sys_category` VALUES (11, '工厂基础信息', '/report/factory-info', 9, '2026-04-28 06:55:36');

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, 'admin', '123456', '2026-04-19 01:23:05', '2026-04-19 01:23:05');

-- ----------------------------
-- Table structure for test_report
-- ----------------------------
DROP TABLE IF EXISTS `test_report`;
CREATE TABLE `test_report`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `farm_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场编号',
  `farm_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '农场名称',
  `report_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '报告类型',
  `report_date` date NULL DEFAULT NULL COMMENT '检测日期',
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'PDF附件链接',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '上传原始文件名',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '检测报告库' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of test_report
-- ----------------------------
INSERT INTO `test_report` VALUES (1, '1', '美民农业', '改良方案', '2026-04-24', '/api/uploads/95fd0608ba9c4d6b984792431ad6cfb3.pdf', '11775789324027379000019d754acee37d2b9402.pdf', NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
