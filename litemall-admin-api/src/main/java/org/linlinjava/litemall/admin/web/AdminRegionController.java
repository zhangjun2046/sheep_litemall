package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.admin.vo.RegionVo;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallRegion;
import org.linlinjava.litemall.db.service.LitemallRegionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/region")
@Validated
public class AdminRegionController {
    private final Log logger = LogFactory.getLog(AdminRegionController.class);

    private static final byte TYPE_PROVINCE = 1;
    private static final byte TYPE_CITY = 2;
    private static final byte TYPE_COUNTY = 3;

    @Autowired
    private LitemallRegionService regionService;

    @RequiresPermissions("admin:region:list")
    @GetMapping("/clist")
    public Object clist(@NotNull Integer id) {
        List<LitemallRegion> regionList = regionService.queryByPid(id);
        return ResponseUtil.okList(regionList);
    }

    @RequiresPermissions("admin:region:list")
    @RequiresPermissionsDesc(menu = {"商场管理", "行政区域"}, button = "查询")
    @GetMapping("/list")
    public Object list() {
        List<RegionVo> regionVoList = new ArrayList<>();

        List<LitemallRegion> litemallRegions = regionService.getAll();
        Map<Byte, List<LitemallRegion>> collect = litemallRegions.stream().collect(Collectors.groupingBy(LitemallRegion::getType));
        List<LitemallRegion> provinceList = collect.getOrDefault(TYPE_PROVINCE, Collections.emptyList());
        List<LitemallRegion> city = collect.getOrDefault(TYPE_CITY, Collections.emptyList());
        Map<Integer, List<LitemallRegion>> cityListMap = city.stream().collect(Collectors.groupingBy(LitemallRegion::getPid));
        List<LitemallRegion> areas = collect.getOrDefault(TYPE_COUNTY, Collections.emptyList());
        Map<Integer, List<LitemallRegion>> areaListMap = areas.stream().collect(Collectors.groupingBy(LitemallRegion::getPid));

        for (LitemallRegion province : provinceList) {
            RegionVo provinceVO = toVo(province);

            List<LitemallRegion> cityList = cityListMap.getOrDefault(province.getId(), Collections.emptyList());
            List<RegionVo> cityVOList = new ArrayList<>();
            for (LitemallRegion cityVo : cityList) {
                RegionVo cityVO = toVo(cityVo);

                List<LitemallRegion> areaList = areaListMap.getOrDefault(cityVo.getId(), Collections.emptyList());
                List<RegionVo> areaVOList = new ArrayList<>();
                for (LitemallRegion area : areaList) {
                    areaVOList.add(toVo(area));
                }

                cityVO.setChildren(areaVOList);
                cityVOList.add(cityVO);
            }
            provinceVO.setChildren(cityVOList);
            regionVoList.add(provinceVO);
        }

        return ResponseUtil.okList(regionVoList);
    }

    @RequiresPermissions("admin:region:read")
    @RequiresPermissionsDesc(menu = {"商场管理", "行政区域"}, button = "详情")
    @GetMapping("/read")
    public Object read(@NotNull Integer id) {
        LitemallRegion region = regionService.findById(id);
        if (region == null) {
            return ResponseUtil.badArgumentValue();
        }
        return ResponseUtil.ok(region);
    }

    @RequiresPermissions("admin:region:create")
    @RequiresPermissionsDesc(menu = {"商场管理", "行政区域"}, button = "添加")
    @PostMapping("/create")
    public Object create(@RequestBody LitemallRegion region) {
        Object error = validateCreate(region);
        if (error != null) {
            return error;
        }
        region.setName(region.getName().trim());
        regionService.add(region);
        return ResponseUtil.ok(region);
    }

    @RequiresPermissions("admin:region:update")
    @RequiresPermissionsDesc(menu = {"商场管理", "行政区域"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody LitemallRegion region) {
        Integer id = region.getId();
        if (id == null) {
            return ResponseUtil.badArgument();
        }
        LitemallRegion db = regionService.findById(id);
        if (db == null) {
            return ResponseUtil.badArgumentValue();
        }

        Object error = validateNameAndCode(region.getName(), region.getCode(), db.getType(), id);
        if (error != null) {
            return error;
        }

        LitemallRegion patch = new LitemallRegion();
        patch.setId(id);
        patch.setName(region.getName().trim());
        patch.setCode(region.getCode());
        if (regionService.updateById(patch) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok(patch);
    }

    @RequiresPermissions("admin:region:delete")
    @RequiresPermissionsDesc(menu = {"商场管理", "行政区域"}, button = "删除")
    @PostMapping("/delete")
    public Object delete(@RequestBody LitemallRegion region) {
        Integer id = region.getId();
        if (id == null) {
            return ResponseUtil.badArgument();
        }
        LitemallRegion db = regionService.findById(id);
        if (db == null) {
            return ResponseUtil.badArgumentValue();
        }
        if (regionService.countByPid(id) > 0) {
            return ResponseUtil.fail(402, "请先删除下级区域");
        }
        regionService.deleteById(id);
        return ResponseUtil.ok();
    }

    private Object validateCreate(LitemallRegion region) {
        Byte type = region.getType();
        if (type == null || (type != TYPE_PROVINCE && type != TYPE_CITY && type != TYPE_COUNTY)) {
            return ResponseUtil.badArgumentValue();
        }

        Integer pid = region.getPid();
        if (type == TYPE_PROVINCE) {
            region.setPid(0);
        } else {
            if (pid == null) {
                return ResponseUtil.badArgument();
            }
            LitemallRegion parent = regionService.findById(pid);
            if (parent == null) {
                return ResponseUtil.badArgumentValue();
            }
            if (type == TYPE_CITY && parent.getType() != TYPE_PROVINCE) {
                return ResponseUtil.badArgumentValue();
            }
            if (type == TYPE_COUNTY && parent.getType() != TYPE_CITY) {
                return ResponseUtil.badArgumentValue();
            }
        }

        return validateNameAndCode(region.getName(), region.getCode(), type, null);
    }

    private Object validateNameAndCode(String name, Integer code, Byte type, Integer excludeId) {
        if (StringUtils.isEmpty(name) || StringUtils.isEmpty(name.trim())) {
            return ResponseUtil.badArgument();
        }
        if (name.trim().length() > 120) {
            return ResponseUtil.badArgumentValue();
        }

        if (code == null || !String.valueOf(code).matches("\\d{6}")) {
            return ResponseUtil.fail(402, "区域编码必须是6位数字");
        }
        if (regionService.countByCodeAndTypeExcludeId(code, type, excludeId) > 0) {
            return ResponseUtil.fail(402, "同一类型下区域编码已存在");
        }
        return null;
    }

    private RegionVo toVo(LitemallRegion region) {
        RegionVo vo = new RegionVo();
        vo.setId(region.getId());
        vo.setName(region.getName());
        vo.setCode(region.getCode());
        vo.setType(region.getType());
        vo.setChildren(new ArrayList<>());
        return vo;
    }
}
