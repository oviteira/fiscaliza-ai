CREATE TABLE `relatorios_agendados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parlamentarId` int NOT NULL,
	`frequencia` enum('diaria','semanal','mensal') NOT NULL,
	`horario` varchar(5) NOT NULL,
	`destinatarios` text NOT NULL,
	`ativo` int DEFAULT 1,
	`ultimaExecucao` timestamp,
	`proximaExecucao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `relatorios_agendados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sincronizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fonte` varchar(100) NOT NULL,
	`status_sinc` enum('iniciada','em_progresso','concluida','erro') NOT NULL,
	`totalRegistros` int DEFAULT 0,
	`registrosProcessados` int DEFAULT 0,
	`registrosErro` int DEFAULT 0,
	`mensagem` text,
	`duracao` int,
	`dataInicio` timestamp DEFAULT (now()),
	`dataFim` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sincronizacoes_id` PRIMARY KEY(`id`)
);
