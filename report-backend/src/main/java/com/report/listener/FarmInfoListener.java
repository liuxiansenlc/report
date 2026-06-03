package com.report.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.report.entity.FarmInfo;
import com.report.mapper.FarmInfoMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class FarmInfoListener implements ReadListener<FarmInfo> {

    // 每一百条存库一次
    private static final int BATCH_COUNT = 100;
    private List<FarmInfo> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);

    private FarmInfoMapper farmInfoMapper;

    // 必须通过构造函数传入 mapper，因为 listener 不是被 spring 管理的
    public FarmInfoListener(FarmInfoMapper farmInfoMapper) {
        this.farmInfoMapper = farmInfoMapper;
    }

    @Override
    public void invoke(FarmInfo data, AnalysisContext context) {
        // 去重策略：查询是否存在该编号的记录
        if (data.getFarmCode() != null) {
            QueryWrapper<FarmInfo> query = new QueryWrapper<>();
            query.eq("farm_code", data.getFarmCode());
            if (farmInfoMapper.selectCount(query) == 0) {
                cachedDataList.add(data);
            } else {
                log.info("跳过了已经存在的农场编号：" + data.getFarmCode());
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
        log.info("所有数据解析完成！");
    }

    private void saveData() {
        if (!cachedDataList.isEmpty()) {
            log.info("{}条数据，开始存储数据库！", cachedDataList.size());
            for (FarmInfo info : cachedDataList) {
                farmInfoMapper.insert(info);
            }
            log.info("存储数据库成功！");
        }
    }
}
