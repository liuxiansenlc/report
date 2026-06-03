package com.report.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import com.report.entity.OrganicMatterDict;
import com.report.mapper.OrganicMatterDictMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class OrganicMatterDictListener implements ReadListener<OrganicMatterDict> {

    private static final int BATCH_COUNT = 100;
    private List<OrganicMatterDict> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
    private OrganicMatterDictMapper mapper;

    public OrganicMatterDictListener(OrganicMatterDictMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void invoke(OrganicMatterDict data, AnalysisContext context) {
        cachedDataList.add(data);
        if (cachedDataList.size() >= BATCH_COUNT) {
            saveData();
            cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        saveData();
        log.info("所有有机质字典数据解析完成！");
    }

    private void saveData() {
        if (!cachedDataList.isEmpty()) {
            log.info("{}条数据，开始存储数据库！", cachedDataList.size());
            for (OrganicMatterDict info : cachedDataList) {
                mapper.insert(info);
            }
            log.info("存储数据库成功！");
        }
    }
}
