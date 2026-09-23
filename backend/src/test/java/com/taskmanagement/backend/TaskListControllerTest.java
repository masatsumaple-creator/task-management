package com.taskmanagement.backend;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

/**
 * リストAPI（POST/PUT/DELETE /api/lists）のテスト。
 * PostgreSQLなしで動かすため h2 プロファイルを使用する。
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class TaskListControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void createAppendsListAtTheEnd() throws Exception {
		int before = listCount();

		mockMvc.perform(post("/api/lists").contentType(MediaType.APPLICATION_JSON)
				.content("{\"title\":\"  レビュー待ち  \"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title", is("レビュー待ち")))
				.andExpect(jsonPath("$.position", is(before)));
	}

	@Test
	void createRejectsBlankTitle() throws Exception {
		mockMvc.perform(post("/api/lists").contentType(MediaType.APPLICATION_JSON)
				.content("{\"title\":\"   \"}"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void updateRenamesList() throws Exception {
		long id = createList("改名前");

		mockMvc.perform(put("/api/lists/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("{\"title\":\"改名後\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title", is("改名後")));
	}

	@Test
	void updateReturns404ForUnknownList() throws Exception {
		mockMvc.perform(put("/api/lists/999999").contentType(MediaType.APPLICATION_JSON)
				.content("{\"title\":\"x\"}"))
				.andExpect(status().isNotFound());
	}

	@Test
	void deleteRemovesListWithItsTasksAndReindexesPositions() throws Exception {
		long first = createList("削除対象");
		long second = createList("残るリスト");
		mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
				.content("{\"listId\":" + first + ",\"title\":\"消えるタスク\",\"priority\":\"low\"}"))
				.andExpect(status().isCreated());

		mockMvc.perform(delete("/api/lists/" + first)).andExpect(status().isNoContent());

		mockMvc.perform(get("/api/tasks").param("listId", String.valueOf(first)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));

		String body = mockMvc.perform(get("/api/lists")).andReturn().getResponse().getContentAsString();
		List<Integer> positions = JsonPath.read(body, "$[*].position");
		for (int i = 0; i < positions.size(); i++) {
			assertEquals(i, positions.get(i), "positions must be contiguous");
		}
		assertTrue(((List<?>) JsonPath.read(body, "$[?(@.id==" + first + ")]")).isEmpty());
		assertFalse(((List<?>) JsonPath.read(body, "$[?(@.id==" + second + ")]")).isEmpty());
	}

	@Test
	void deleteReturns404ForUnknownList() throws Exception {
		mockMvc.perform(delete("/api/lists/999999")).andExpect(status().isNotFound());
	}

	private int listCount() throws Exception {
		String body = mockMvc.perform(get("/api/lists")).andReturn().getResponse().getContentAsString();
		return JsonPath.read(body, "$.length()");
	}

	private long createList(String title) throws Exception {
		String body = mockMvc.perform(post("/api/lists").contentType(MediaType.APPLICATION_JSON)
				.content("{\"title\":\"" + title + "\"}"))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
		return ((Number) JsonPath.read(body, "$.id")).longValue();
	}
}
