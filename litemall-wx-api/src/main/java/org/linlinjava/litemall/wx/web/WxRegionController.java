package org.linlinjava.litemall.wx.web;

import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallRegion;
import org.linlinjava.litemall.db.service.LitemallRegionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wx/region")
@Validated
public class WxRegionController {
    private static final byte TYPE_COUNTY = 3;

    @Autowired
    private LitemallRegionService regionService;

    /**
     * 按父级查询下一级区域。pid=0 为省级。
     */
    @GetMapping("/list")
    public Object list(@NotNull Integer pid) {
        List<LitemallRegion> regionList = regionService.queryByPid(pid);
        return ResponseUtil.okList(regionList);
    }

    /**
     * 按区县编码回填省/市/区。固定按 type=3 查询，避免东莞等同码命中多条。
     */
    @GetMapping("/chain")
    public Object chain(@NotNull Integer code) {
        LitemallRegion county = regionService.findByCodeAndType(code, TYPE_COUNTY);
        if (county == null) {
            return ResponseUtil.badArgumentValue();
        }
        LitemallRegion city = regionService.findById(county.getPid());
        if (city == null) {
            return ResponseUtil.badArgumentValue();
        }
        LitemallRegion province = regionService.findById(city.getPid());
        if (province == null) {
            return ResponseUtil.badArgumentValue();
        }

        Map<String, Object> data = new HashMap<>(3);
        data.put("province", province);
        data.put("city", city);
        data.put("county", county);
        return ResponseUtil.ok(data);
    }
}
