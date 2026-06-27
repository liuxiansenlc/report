package com.report.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;

@Configuration
public class SchemaCompatibilityConfig {

    @Bean
    public CommandLineRunner reportSchemaCompatibility(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        return args -> {
            if (!hasColumn(dataSource, "test_report", "report_source")) {
                jdbcTemplate.execute("ALTER TABLE test_report ADD COLUMN report_source VARCHAR(20) DEFAULT 'MANUAL'");
            }
            if (!hasColumn(dataSource, "test_report", "frontend_visible")) {
                jdbcTemplate.execute("ALTER TABLE test_report ADD COLUMN frontend_visible TINYINT DEFAULT 1");
            }
            jdbcTemplate.update("UPDATE test_report SET report_source = 'MANUAL' WHERE report_source IS NULL OR report_source = ''");
            jdbcTemplate.update("UPDATE test_report SET frontend_visible = 1 WHERE frontend_visible IS NULL");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS dashboard_font_config (" +
                    "id BIGINT PRIMARY KEY, " +
                    "global_scale DECIMAL(5,2) DEFAULT 1.00, " +
                    "header_scale DECIMAL(5,2) DEFAULT 1.00, " +
                    "left_scale DECIMAL(5,2) DEFAULT 1.00, " +
                    "center_scale DECIMAL(5,2) DEFAULT 1.00, " +
                    "right_scale DECIMAL(5,2) DEFAULT 1.00, " +
                    "analysis_scale DECIMAL(5,2) DEFAULT 1.00, " +
                    "chart_scale DECIMAL(5,2) DEFAULT 1.00, " +
                    "overlay_scale DECIMAL(5,2) DEFAULT 1.00, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            jdbcTemplate.update("INSERT INTO dashboard_font_config " +
                    "(id, global_scale, header_scale, left_scale, center_scale, right_scale, analysis_scale, chart_scale, overlay_scale) " +
                    "SELECT 1, 1, 1, 1, 1, 1, 1, 1, 1 WHERE NOT EXISTS (SELECT 1 FROM dashboard_font_config WHERE id = 1)");
        };
    }

    private boolean hasColumn(DataSource dataSource, String tableName, String columnName) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            ResultSet rs = connection.getMetaData().getColumns(null, null, tableName, columnName);
            if (rs.next()) return true;
            rs = connection.getMetaData().getColumns(null, null, tableName.toUpperCase(), columnName.toUpperCase());
            if (rs.next()) return true;
            rs = connection.getMetaData().getColumns(null, null, tableName.toLowerCase(), columnName.toLowerCase());
            return rs.next();
        }
    }
}
