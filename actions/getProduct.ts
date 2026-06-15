import prisma from '@/libs/prismadb'


export interface IProductParams{
    category?: string | string[] | null;
    searchTerm?: string | null;
    isNewArrival?: boolean | null;

}

const getCategoryCandidates = (category?: string | string[] | null) => {
    const rawCategory = Array.isArray(category) ? category[0] : category;
    const normalizedCategory = rawCategory?.trim();

    if (!normalizedCategory || normalizedCategory.toLowerCase() === 'all') {
        return [];
    }

    const candidates = new Set([normalizedCategory]);

    if (normalizedCategory.endsWith('s')) {
        candidates.add(normalizedCategory.slice(0, -1));
    } else {
        candidates.add(`${normalizedCategory}s`);
    }

    return Array.from(candidates);
}

export default async function getProducts(params: IProductParams){
    try {
        const {category,searchTerm,isNewArrival} = params;
        let searchString = searchTerm;

        if (!searchTerm) {
            searchString = ''
        }

        let query:any = {}

        const categoryCandidates = getCategoryCandidates(category);

        if (categoryCandidates.length > 0) {
            query.OR = categoryCandidates.map((value) => ({
                category: {
                    equals: value,
                    mode: 'insensitive',
                },
            }));
        }

        if (typeof isNewArrival === 'boolean') {
            query.isNewArrival = isNewArrival
        }

        const products = await prisma.product.findMany({
            where:{
                ...query,
                AND: [
                    {
                        OR: [
                            {
                                name:{
                                    contains : searchString,
                                    mode : 'insensitive'
                                },
                            },
                            {
                                description:{
                                    contains : searchString,
                                    mode : 'insensitive'
                                },
                            },
                        ],
                    },
                ]
            },
            include:{
                reviews:{
                    include:{
                        user : true

                    },
                    orderBy:{
                        createdDate : 'desc'
                    }
                }
            },
            orderBy:{
                createdAt: 'desc'
            }
        })

        return products
    } catch (error : any) {
        throw new Error(error);
    }
}
