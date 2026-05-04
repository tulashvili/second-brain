.PHONY: dev_build deploy_changes

include .env
export

dev_build:
	$(PY_ENV)/python3 $(SYNC_BRAIN_NOTES) && npx quartz build --serve

save:
	npx quartz sync --no-pull

deploy:
	$(PY_ENV)/python3 $(SYNC_BRAIN_NOTES) && npx quartz build

	rsync -avz --delete \
	-e "ssh -i $(SSH_KEY)" \
	$(BRAIN_LOCAL_PATH) $(NGINX_CONFIG_PATH) $(DEPLOY_USER)@$(DEPLOY_SERVER):$(BRAIN_REMOTE_PATH)

	ssh $(ROOT_USER)@$(DEPLOY_SERVER) "sudo nginx -t && sudo systemctl reload nginx"
