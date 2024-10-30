export type GeneralInfoFormValues = {
    part_number?: string | null;
    client?: string | null;
    box?: string | null;
    pieces_x_box?: number | null;
    rubber_compound?: string | null;
    price?: number | null;
    standard?: number | null;
};

export type PalletAssemblyFormValues = {
    pallet?: string | null;
    box_x_pallet?: number | null;
    pieces_x_pallet?: number | null;
    assembly?: string | null;
    accessories?: string | null;
    mold?: string | null;
    instructive?: string | null;
    insert?: string | null;
    gripper?: string | null;
};


export type PaintScrapFormValues = {
    caliber?: string | null;
    paint?: string | null;
    std_paint?: number | null;
    painter?: number | null;
    scrap?: number | null;
    box_logo?: string | null;
};


export type LabelsCavitiesFormValues = {
    cavities?: number | null;
    category?: string | null;
    type2?: string | null;
    measurement?: string | null;
    special?: string | null;
    piece_label?: string | null;
    qty_piece_labels?: number | null;
    box_label?: string | null;
    qty_box_labels?: number | null;
    box_label_2?: string | null;
    qty_box_labels_2?: number | null;
    box_label_3?: string | null;
    qty_box_labels_3?: number | null;
};


export type ImagesOthersFormValues = {
    made_in_mexico?: string | null;
    staples?: string | null;
    image_piece_label?: File | null;
    image_box_label?: File | null;
    image_box_label_2?: File | null;
    image_box_label_3?: File | null;
};


export type PartNumberFormValues = GeneralInfoFormValues &
    PalletAssemblyFormValues &
    PaintScrapFormValues &
    LabelsCavitiesFormValues &
    ImagesOthersFormValues;
