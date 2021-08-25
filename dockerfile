FROM node:latest
WORKDIR /usr/app
COPY ./ /usr/app
#COPY ["package.json","package-lock.json","./"]
RUN npm install --production
#RUN npm install apexcharts --save
RUN npm install react-google-charts --save
RUN npm install react-dynamic-modal --save
#RUN npm audit fix
EXPOSE 3000
CMD ["npm","start"]
