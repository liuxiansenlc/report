package com.report.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.report.entity.ServiceStation;
import com.report.mapper.ServiceStationMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class ServiceStationListener implements ReadListener<ServiceStation> {

    private static final int BATCH_COUNT = 100;
    private List<ServiceStation> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);

    private ServiceStationMapper mapper;

    public ServiceStationListener(ServiceStationMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void invoke(ServiceStation data, AnalysisContext context) {
        if (data.getName() != null) {
            QueryWrapper<ServiceStation> query = new QueryWrapper<>();
            query.eq("name", data.getName());
            if (mapper.selectCount(query) == 0) {
                cachedDataList.add(data);
            } else {
                log.info("跳过了已经存在的服务点：" + data.getName());
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
        log.info("所有服务点数据解析完成！");
    }

    private void saveData() {
        if (!cachedDataList.isEmpty()) {
            log.info("{}条数据，开始存储数据库！", cachedDataList.size());
            for (ServiceStation info : cachedDataList) {
                mapper.insert(info);
            }
            log.info("存储数据库成功！");
        }
    }
}
