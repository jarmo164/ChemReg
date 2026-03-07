package com.chemreg.ChemReg;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String home() {
        return "ChemReg backend töötab";
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}