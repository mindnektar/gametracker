import gql from 'graphql-tag';

export const addDataToCache = (cache, data, fieldName, typeName) => {
    if (data) {
        cache.modify({
            fields: {
                [fieldName]: (existingItems, { readField }) => {
                    if (existingItems.some((item) => readField('id', item) === data.id)) {
                        return existingItems;
                    }

                    const itemRef = cache.writeFragment({
                        data,
                        fragment: gql`
                            fragment ${typeName}Fragment on ${typeName} {
                                id
                            }
                        `,
                    });

                    return [...existingItems, itemRef];
                },
            },
        });
    }
};
