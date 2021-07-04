import { apiBaseUrl } from '../api';

export default {
    methods: {
        apiImage(image) {
            return `${apiBaseUrl}/${image}`;
        },
    },
};
