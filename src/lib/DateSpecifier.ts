import { Data } from "dataclass";
import { z } from "zod";


const DateSpecifierSchema = z.object({
    // all: boolean
    // dates: 1/20/24
    daysOfTheWeek: z.array(z.string()),
    // weeks: [1,2,3] (not the fourth week)
    // exclude: (specific dates removed)
});

export type DateSpecifier = Readonly<z.infer<typeof DateSpecifierSchema>>
