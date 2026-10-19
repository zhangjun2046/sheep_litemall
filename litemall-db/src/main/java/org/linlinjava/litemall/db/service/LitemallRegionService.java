package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
import org.linlinjava.litemall.db.dao.LitemallRegionMapper;
import org.linlinjava.litemall.db.domain.LitemallRegion;
import org.linlinjava.litemall.db.domain.LitemallRegionExample;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.List;

@Service
public class LitemallRegionService {

    @Resource
    private LitemallRegionMapper regionMapper;

    public List<LitemallRegion> getAll(){
        LitemallRegionExample example = new LitemallRegionExample();
        byte b = 4;
        example.or().andTypeNotEqualTo(b);
        example.setOrderByClause("code asc");
        return regionMapper.selectByExample(example);
    }

    public List<LitemallRegion> queryByPid(Integer parentId) {
        LitemallRegionExample example = new LitemallRegionExample();
        example.or().andPidEqualTo(parentId);
        example.setOrderByClause("code asc");
        return regionMapper.selectByExample(example);
    }

    public LitemallRegion findById(Integer id) {
        return regionMapper.selectByPrimaryKey(id);
    }

    public LitemallRegion findByCodeAndType(Integer code, Byte type) {
        LitemallRegionExample example = new LitemallRegionExample();
        example.or().andCodeEqualTo(code).andTypeEqualTo(type);
        return regionMapper.selectOneByExample(example);
    }

    public long countByPid(Integer pid) {
        LitemallRegionExample example = new LitemallRegionExample();
        example.or().andPidEqualTo(pid);
        return regionMapper.countByExample(example);
    }

    public long countByCodeAndTypeExcludeId(Integer code, Byte type, Integer id) {
        LitemallRegionExample example = new LitemallRegionExample();
        LitemallRegionExample.Criteria criteria = example.createCriteria();
        criteria.andCodeEqualTo(code).andTypeEqualTo(type);
        if (id != null) {
            criteria.andIdNotEqualTo(id);
        }
        return regionMapper.countByExample(example);
    }

    public void add(LitemallRegion region) {
        regionMapper.insertSelective(region);
    }

    public int updateById(LitemallRegion region) {
        return regionMapper.updateByPrimaryKeySelective(region);
    }

    public void deleteById(Integer id) {
        regionMapper.deleteByPrimaryKey(id);
    }

    public List<LitemallRegion> querySelective(String name, Integer code, Integer page, Integer size, String sort, String order) {
        LitemallRegionExample example = new LitemallRegionExample();
        LitemallRegionExample.Criteria criteria = example.createCriteria();

        if (!StringUtils.isEmpty(name)) {
            criteria.andNameLike("%" + name + "%");
        }
        if (!StringUtils.isEmpty(code)) {
            criteria.andCodeEqualTo(code);
        }

        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            example.setOrderByClause(sort + " " + order);
        } else {
            example.setOrderByClause("code asc");
        }

        PageHelper.startPage(page, size);
        return regionMapper.selectByExample(example);
    }

}
