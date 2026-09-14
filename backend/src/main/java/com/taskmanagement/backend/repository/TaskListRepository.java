package com.taskmanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taskmanagement.backend.entity.TaskList;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {
}
