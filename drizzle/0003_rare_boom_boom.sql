CREATE TABLE `exportacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`tipo_export` enum('relatorios','dados','graficos') NOT NULL,
	`status_export` enum('pendente','processando','concluida','erro') DEFAULT 'pendente',
	`totalItens` int DEFAULT 0,
	`itensProcessados` int DEFAULT 0,
	`urlArquivo` text,
	`mensagemErro` text,
	`dataInicio` timestamp DEFAULT (now()),
	`dataFim` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exportacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`recurso` varchar(100) NOT NULL,
	`acao` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissoes_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `roles_permissoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(50) NOT NULL,
	`permissaoId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_permissoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('visualizador','analista','admin') NOT NULL DEFAULT 'visualizador';--> statement-breakpoint
ALTER TABLE `users` ADD `githubId` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `googleId` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `permissoes` text DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `users` ADD `ativo` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_githubId_unique` UNIQUE(`githubId`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_googleId_unique` UNIQUE(`googleId`);