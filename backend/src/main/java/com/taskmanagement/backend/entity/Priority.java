package com.taskmanagement.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * カードの優先度（3段階）。
 * フロントエンドに合わせて、JSON上は小文字（high / medium / low）で表現する。
 */
public enum Priority {
	HIGH,
	MEDIUM,
	LOW;

	@JsonValue
	public String toJson() {
		return name().toLowerCase();
	}

	@JsonCreator
	public static Priority fromJson(String value) {
		return Priority.valueOf(value.toUpperCase());
	}
}
