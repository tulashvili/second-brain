.PHONY: build deploy save

include .env
export

build:
	npx quartz build --serve

save:
	npx quartz sync --no-pull 

deploy:
	python3 $(LOCAL_SYNC_DIR) && npx quartz build

	rsync -avz --delete \
	-e "ssh -i $(SSH_KEY)" \
	$(SRC) $(DEPLOY_USER)@$(DEPLOY_SERVER):$(DEPLOY_PATH)

	ssh $(ROOT_USER)@$(DEPLOY_SERVER) "sudo nginx -t && sudo systemctl reload nginx"