// import { GiNecklace, GiEarrings, GiRing, GiHandBag, GiBracer, GiClothes } from "react-icons/gi";
// import { MdStorefront } from "react-icons/md";

// export const categories = [
//     {
//         label: 'All',
//         icon: MdStorefront
//     },
//     {
//         label: 'Earrings',
//         icon: GiEarrings
//     },
//     {
//         label: 'Necklace',
//         icon: GiNecklace
//     },
//     {
//         label: 'Rings',
//         icon: GiRing
//     },
//     {
//         label: 'Bracelets',
//         icon: GiBracer
//     },
//     {
//         label: 'Handbags',
//         icon: GiHandBag
//     },
//     {
//         label: 'Clothing',
//         icon: GiClothes
//     },
// ];
import { MdStorefront } from "react-icons/md";
import { GiSpiralBottle, GiPaintBrush, GiWaterDrop, GiPencilBrush } from "react-icons/gi";
import { FaDrawPolygon, FaHandHoldingHeart, FaIdBadge, FaKey } from "react-icons/fa";
import { TbBrush, TbDropletHalf2, TbCircleDotted } from "react-icons/tb";

export const categories = [
    {
        label: "All",
        icon: MdStorefront,
    },
    {
        label: "Mandalas",
        icon: GiSpiralBottle,
    },
    {
        label: "Dot Mandalas",
        icon: TbCircleDotted,
    },
    {
        label: "Watercolor Paintings",
        icon: GiWaterDrop,
    },
    {
        label: "Acrylic Paintings",
        icon: TbBrush,
    },
    {
        label: "Madhubani",
        icon: FaDrawPolygon,
    },
    {
        label: "Key Chains",
        icon: FaKey,        // 🔑 clearly represents keychains
    },
    {
        label: "Name Plate",
        icon: FaIdBadge,   // 🪪 represents name / identity plate
    },
    // {
    //     label: "Sketches",
    //     icon: GiPencilBrush,
    // },

    // {
    //     label: "Ink Art",
    //     icon: TbDropletHalf2,
    // },
    // {
    //     label: "Handmade Crafts",
    //     icon: FaHandHoldingHeart,
    // },
];
