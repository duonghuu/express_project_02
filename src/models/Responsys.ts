import { ObjectId } from "mongodb";
import { Entity, ObjectIdColumn } from "typeorm";

@Entity("responsys")
export class Responsys {
    @ObjectIdColumn()
    id!: ObjectId;
}
