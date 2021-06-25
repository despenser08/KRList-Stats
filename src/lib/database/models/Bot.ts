import {
  getModelForClass,
  modelOptions,
  prop,
  Severity
} from "@typegoose/typegoose";
import { RawStatus } from "../../types";

class BotStats {
  @prop({ required: true })
  public updated!: Date;

  @prop({ required: true })
  public votes!: number;

  @prop()
  public servers?: number;

  @prop({ required: true })
  public status!: RawStatus;
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
class Bot {
  @prop({ required: true, unique: true })
  id!: string;

  @prop({ required: true, default: false })
  track!: boolean;

  @prop({ default: [] })
  stats: BotStats[];
}

export default getModelForClass(Bot);
