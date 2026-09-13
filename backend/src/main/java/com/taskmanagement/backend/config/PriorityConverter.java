package com.taskmanagement.backend.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import com.taskmanagement.backend.entity.Priority;

/**
 * クエリパラメータ（例: {@code ?priority=high}）からPriorityへの変換を、
 * JSONと同じく小文字表記で受け付けられるようにする。
 * これが無いと、Springの既定の変換では {@code Priority.valueOf("high")} が呼ばれて失敗する。
 */
@Component
public class PriorityConverter implements Converter<String, Priority> {

	@Override
	public Priority convert(String source) {
		return Priority.fromJson(source);
	}
}
