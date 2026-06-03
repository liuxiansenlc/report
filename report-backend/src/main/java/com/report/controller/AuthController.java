package com.report.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.report.common.Result;
import com.report.entity.Category;
import com.report.entity.User;
import com.report.mapper.CategoryMapper;
import com.report.mapper.UserMapper;
import com.report.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private JwtUtils jwtUtils;

    public static class LoginRequest {
        public String username;
        public String password;
    }

    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody LoginRequest request) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", request.username)
                    .eq("password", request.password); // 在真实生产环境中应使用加密比对
        
        User user = userMapper.selectOne(queryWrapper);
        
        if (user != null) {
            Map<String, String> data = new HashMap<>();
            String token = jwtUtils.generateToken(user.getUsername());
            data.put("token", token);
            data.put("username", user.getUsername());
            return Result.success("登录成功", data);
        } else {
            return Result.error(401, "用户名或密码错误");
        }
    }
    
    @GetMapping("/modules")
    public Result<List<Category>> getModules() {
        QueryWrapper<Category> query = new QueryWrapper<>();
        query.orderByAsc("sort_order");
        List<Category> categories = categoryMapper.selectList(query);
        return Result.success(categories);
    }
    
    public static class PasswordRequest {
        public String username;
        public String oldPassword;
        public String newPassword;
    }

    @PostMapping("/password")
    public Result<String> updatePassword(@RequestBody PasswordRequest request) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", request.username)
                    .eq("password", request.oldPassword);
        
        User user = userMapper.selectOne(queryWrapper);
        if (user != null) {
            user.setPassword(request.newPassword);
            userMapper.updateById(user);
            return Result.success("密码修改成功");
        } else {
            return Result.error(400, "原密码错误");
        }
    }
}
