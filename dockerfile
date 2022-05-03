FROM node:latest
WORKDIR /usr/app
COPY ./ /usr/app
#COPY ["package.json","package-lock.json","./"]
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm install --production
#RUN npm install apexcharts --save
#RUN npm install axios --save
#RUN npm install minio --save
#RUN npm install react --save
#RUN npm install react-bootstrap --save
#RUN npm install react-data-table-component --save
#RUN npm install react-dom --save
#RUN npm install react-dynamic-modal --save
#RUN npm install react-google-charts --save
#RUN npm install react-scripts --save
#RUN npm install react-tabs --save
#RUN npm install web-vitals --save
#RUN npm install websocket --save

#RUN npm install @material-ui/core --save
#RUN npm install @testing-library/jest-dom --save
#RUN npm install @testing-library/react --save
#RUN npm install @testing-library/user-event --save

#RUN npm audit fix
EXPOSE 3000
CMD ["npm","start"]
