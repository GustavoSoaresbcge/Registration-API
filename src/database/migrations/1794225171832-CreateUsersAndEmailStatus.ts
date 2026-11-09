import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersAndEmailStatus1794225171832 implements MigrationInterface {
    name = 'CreateUsersAndEmailStatus1794225171832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "email" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."email_status_status_enum" AS ENUM('PENDING', 'SENT', 'ERROR')`);
        await queryRunner.query(`CREATE TABLE "email_status" ("id" SERIAL NOT NULL, "status" "public"."email_status_status_enum" NOT NULL DEFAULT 'PENDING', "error_message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "PK_dcc5bc9a22211af5c30732ecf02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email_status" ADD CONSTRAINT "FK_55bceb6a25fa8d32f820ca82904" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_status" DROP CONSTRAINT "FK_55bceb6a25fa8d32f820ca82904"`);
        await queryRunner.query(`DROP TABLE "email_status"`);
        await queryRunner.query(`DROP TYPE "public"."email_status_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
