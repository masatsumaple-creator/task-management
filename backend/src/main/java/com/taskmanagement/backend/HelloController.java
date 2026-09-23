package com.taskmanagement.backend;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 起動確認・疎通確認用の最小限のAPI。
 * Board / List / Task のエンティティ・APIはまだ実装していない。
 */
@RestController
public class HelloController {

	@GetMapping("/api/hello")
	public Map<String, String> hello() {
		return Map.of("message", "Hello from Spring Boot backend");
	}

}
