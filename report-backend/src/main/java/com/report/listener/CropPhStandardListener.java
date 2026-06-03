package com.report.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.report.entity.CropPhStandard;
import com.report.mapper.CropPhStandardMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class CropPhStandardListener implements ReadListener<CropPhStandard> {

    private static final int BATCH_COUNT = 100;
    private List<CropPhStandard> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
    private CropPhStandardMapper mapper;

    public CropPhStandardListener(CropPhStandardMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void invoke(CropPhStandard data, AnalysisContext context) {
        // 以作物编号去重
        if (data.getCropCode() != null && !data.getCropCode().trim().isEmpty()) {
            QueryWrapper<CropPhStandard> query = new QueryWrapper<>();
            query.eq("crop_code", data.getCropCode());
            if (mapper.selectCount(query) == 0) {
                cachedDataList.add(data);
            } else {
                log.info("跳过了已经存在的作物编号：" + data.getCropCode());
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
        log.info("所有pH数据解析完成！");
    }

    private void saveData() {
        if (!cachedDataList.isEmpty()) {
            log.info("{}条数据，开始存储数据库！", cachedDataList.size());
            for (CropPhStandard info : cachedDataList) {
                mapper.insert(info);
            }
            log.info("存储数据库成功！");
        }
    }
}
