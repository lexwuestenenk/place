export type Canvas = {
    id: string
    name: string
    width: number
    height: number
    cooldown: number
    pixels?: Pixel[]
    colors?: Color[]
    updated_at: string
    inserted_at: string
}

export type Color = {
    id: string;
    hex: string;
    index: number;
};

export type Pixel = {
    x: number;
    y: number;
    color: Color;
  };

  
export type User = {
    id: string
    username: string
    email: string
    role: "user" | "admin"
    inserted_at: string
    updated_at: string
}
