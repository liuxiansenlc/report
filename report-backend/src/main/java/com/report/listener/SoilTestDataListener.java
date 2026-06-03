package com.report.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import com.report.entity.SoilTestData;
import com.report.mapper.SoilTestDataMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class SoilTestDataListener implements ReadListener<SoilTestData> {

    // 考虑到基本指标包含庞大列宽，批处理保持100以防御内存溢出
    private static final int BATCH_COUNT = 100;
    private List<SoilTestData> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
    private SoilTestDataMapper mapper;

    public SoilTestDataListener(SoilTestDataMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void invoke(SoilTestData data, AnalysisContext context) {
        cachedDataList.add(data);
        if (cachedDataList.size() >= BATCH_COUNT) {
            saveData();
            cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        saveData();
        log.info("所有土壤基本指标数据解析完成！");
    }

    private void saveData() {
        if (!cachedDataList.isEmpty()) {
            log.info("{}条土壤基本指标数据，开始存储数据库！", cachedDataList.size());
            for (SoilTestData info : cachedDataList) {
                mapper.insert(info);
            }
            log.info("存储数据库成功！");
        }
    }
}
