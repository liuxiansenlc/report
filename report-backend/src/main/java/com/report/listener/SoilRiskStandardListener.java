package com.report.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import com.report.entity.SoilRiskStandard;
import com.report.mapper.SoilRiskStandardMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class SoilRiskStandardListener implements ReadListener<SoilRiskStandard> {

    private static final int BATCH_COUNT = 100;
    private List<SoilRiskStandard> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
    private SoilRiskStandardMapper mapper;

    public SoilRiskStandardListener(SoilRiskStandardMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void invoke(SoilRiskStandard data, AnalysisContext context) {
        // 重金属标准通常没有严格的主键单号去重，为快速导入，支持直接追加或需要在上层先清洗
        cachedDataList.add(data);
        if (cachedDataList.size() >= BATCH_COUNT) {
            saveData();
            cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        saveData();
        log.info("所有土壤风险标准数据解析完成！");
    }

    private void saveData() {
        if (!cachedDataList.isEmpty()) {
            log.info("{}条数据，开始存储数据库！", cachedDataList.size());
            for (SoilRiskStandard info : cachedDataList) {
                mapper.insert(info);
            }
            log.info("存储数据库成功！");
        }
    }
}
