import axios, { AxiosInstance, AxiosResponse, Method } from "axios";

class Network {
    customAxiosInstance: AxiosInstance;
    token: string;

    constructor() {
        let baseURL = "localhost:3000";
        if (process.env.REACT_APP_API_HOST) {
            baseURL = `//${process.env.REACT_APP_API_HOST}`;
        }
        axios.defaults.baseURL = baseURL;
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";

        this.customAxiosInstance = axios.create({
            validateStatus: function (status) {
                return status === 200;
            },
        });
        this.token = "";
    }

    async request<T>(
        method: Method,
        url: string,
        data: unknown = undefined,
        headers: Record<string, string> = {}
    ): Promise<T> {
        let response: AxiosResponse<T>;

        try {
            response = await this.customAxiosInstance({
                method,
                url,
                data,
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    ...headers,
                },
            });
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    throw new Error(err.response.data.error);
                } else {
                    throw new Error(err.message);
                }
            }
            throw new Error("Unknown");
        }
    }

    setAuthentificationToken = (token: string) => {
        this.token = token;
    };
}

export default new Network();
