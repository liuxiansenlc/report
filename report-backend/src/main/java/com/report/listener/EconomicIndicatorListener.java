package com.report.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.report.entity.EconomicIndicator;
import com.report.mapper.EconomicIndicatorMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class EconomicIndicatorListener implements ReadListener<EconomicIndicator> {

    private static final int BATCH_COUNT = 100;
    private List<EconomicIndicator> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);

    private EconomicIndicatorMapper mapper;

    public EconomicIndicatorListener(EconomicIndicatorMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void invoke(EconomicIndicator data, AnalysisContext context) {
        // 重复校验：同一农场且同一类型
        if (data.getFarmCode() != null && data.getType() != null) {
            QueryWrapper<EconomicIndicator> query = new QueryWrapper<>();
            query.eq("farm_code", data.getFarmCode()).eq("type", data.getType());
            if (mapper.selectCount(query) == 0) {
                cachedDataList.add(data);
            } else {
                log.info("跳过了已经存在的经济指标：" + data.getFarmCode() + " - " + data.getType());
            }
        }

        if (cachedDataList.size() >= BATCH_COUNT) {
            saveData();
            cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        saveData();
        log.info("所有经济指标数据解析完成！");
    }

    private void saveData() {
        if (!cachedDataList.isEmpty()) {
            log.info("{}条数据，开始存储数据库！", cachedDataList.size());
            for (EconomicIndicator info : cachedDataList) {
                mapper.insert(info);
            }
            log.info("存储数据库成功！");
        }
    }
}
